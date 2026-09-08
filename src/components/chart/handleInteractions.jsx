// src/chart/handleInteractions.jsx
import { linkPositionFromEdges, normalizeLinkStatus } from "./drawHelpers";
import * as d3 from "d3";

// --- Helper function to create payload for link popups ---
export function createLinkPopupPayload(linkDataObject) {
  if (!linkDataObject) return null;

  const raw = linkDataObject.rawLink || linkDataObject;

  const sourceId =
    typeof linkDataObject.source === "object" && linkDataObject.source !== null
      ? linkDataObject.source.id || linkDataObject.source.hostname || linkDataObject.source.name
      : (linkDataObject.sourceNode || linkDataObject.sourceName || linkDataObject.source);

  const targetId =
    typeof linkDataObject.target === "object" && linkDataObject.target !== null
      ? linkDataObject.target.id || linkDataObject.target.hostname || linkDataObject.target.name
      : (linkDataObject.targetNode || linkDataObject.targetName || linkDataObject.target);

  const status = normalizeLinkStatus(linkDataObject);
  const physicalStatus =
    raw.physical_status ||
    raw.physicalStatus ||
    linkDataObject.physical_status ||
    linkDataObject.physicalStatus ||
    (status === "down" ? "Down" : "Up");

  const protocolStatus =
    raw.protocol_status ||
    raw.protocolStatus ||
    linkDataObject.protocol_status ||
    linkDataObject.protocolStatus ||
    (status === "down" ? "Down" : "Up");

  const mpls = raw.mpls_ldp || raw.MPLS || raw.mpls || linkDataObject.MPLS || linkDataObject.mpls || "Enabled";
  const ospf = raw.ospf || raw.ospf_state || raw.OSPF || linkDataObject.OSPF || linkDataObject.ospf || "Enabled";
  const rawBw = raw.bw ?? raw.bandwidth ?? raw.Bandwidth ?? linkDataObject.bandwidth ?? "10 Gbps";
  const bandwidth =
    typeof rawBw === "number"
      ? rawBw >= 1000
        ? `${rawBw / 1000} Gbps`
        : `${rawBw} Mbps`
      : String(rawBw);

  const description =
    raw.description ||
    raw.Description ||
    linkDataObject.description ||
    "Core backbone fiber link";
  const mediaType =
    raw.media_type ||
    raw.MediaType ||
    raw.mediaType ||
    linkDataObject.mediaType ||
    "Fiber Optic";
  const rawTx = raw.tx ?? raw.TX ?? linkDataObject.tx ?? "N/A";
  const rawRx = raw.rx ?? raw.RX ?? linkDataObject.rx ?? "N/A";
  const rawMtu = raw.mtu ?? raw.MTU ?? linkDataObject.mtu ?? "N/A";
  const tx = typeof rawTx === "number" ? `${rawTx} dBm` : String(rawTx);
  const rx = typeof rawRx === "number" ? `${rawRx} dBm` : String(rawRx);
  const mtu = typeof rawMtu === "number" ? String(rawMtu) : String(rawMtu);
  const ip = raw.ip || linkDataObject.ip || "N/A";
  const sourceZone = linkDataObject.sourceZone || raw.sourceZone || "N/A";
  const targetZone = linkDataObject.targetZone || raw.targetZone || "N/A";

  const popupId =
    linkDataObject.id ||
    `${sourceId}-${targetId}-${Math.random().toString(16).slice(2)}`;

  return {
    ...raw,
    ...linkDataObject,
    type: "link",
    id: popupId,
    linkId: linkDataObject.id || popupId,
    source: sourceId,
    target: targetId,
    sourceNode: sourceId,
    targetNode: targetId,
    sourceName: sourceId,
    targetName: targetId,
    sourceZone,
    targetZone,
    name: `Link ${sourceId} ⟷ ${targetId}`,
    status,
    normalizedStatus: status,
    physicalStatus,
    protocolStatus,
    mpls,
    ospf,
    bandwidth,
    description,
    mediaType,
    tx,
    rx,
    mtu,
    ip,
  };
}

// ===================================================================
// Helper function to get the correct color by category / status
// ===================================================================
export function getLinkColorByCategory(linkData, palette) {
  if (!linkData) return palette?.link || "#6b7280";
  const status = normalizeLinkStatus(linkData);
  if (status === "down") {
    return palette?.status?.down || "#ef4444";
  }
  if (status === "issue") {
    return palette?.status?.issue || "#f59e0b";
  }
  return palette?.status?.up || "#22c55e";
}

// ===================================================================
// Helper to generate directional tooltip text based on node positions
// ===================================================================
export function getTooltipDirectionalText(d, sourceNode, targetNode) {
  const localIf = d.local_interface || "Unknown";
  const remoteIf = d.remote_interface || "Unknown";

  if (!d.local_interface && !d.remote_interface) return d.id;

  const sX = sourceNode ? sourceNode.x : (d.source.x || 0);
  const tX = targetNode ? targetNode.x : (d.target.x || 0);
  const sY = sourceNode ? sourceNode.y : (d.source.y || 0);
  const tY = targetNode ? targetNode.y : (d.target.y || 0);

  // Consider source to be "left" if its X is strictly less, OR if X is equal and Y is less
  const sourceIsLeft = sX < tX || (sX === tX && sY < tY);

  if (sourceIsLeft) {
    // local is on the left, remote is on the right
    return `${localIf} -> ${remoteIf}`;
  } else {
    // remote is on the left, local is on the right
    // arrow points from local (right) to remote (left)
    return `${remoteIf} <- ${localIf}`;
  }
}

// ===================================================================
// Fast Apply / Restore Marked Links & Nodes State (Hardware CSS Accelerated)
// ===================================================================
export function applyMarkedState({
  svg,
  markedLinkIds,
  hoveredLinkId,
  palette,
  theme,
}) {
  if (!svg || !svg.node()) return;

  const isDark = theme === "dark";
  const defaultLinkColor = palette?.link || (isDark ? "#94a3b8" : "#6b7280");
  const defaultNodeColor = palette?.node || "#29c6e0";
  const defaultNodeStroke = palette?.stroke || (isDark ? "#60a5fa" : "#1d4ed8");

  const hasMarked =
    (markedLinkIds && markedLinkIds.size > 0) || Boolean(hoveredLinkId);

  if (!hasMarked) {
    svg
      .selectAll("line.visible-link")
      .attr("stroke", defaultLinkColor)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2)
      .style("opacity", 1);

    svg
      .selectAll("circle.node")
      .style("opacity", 0.9)
      .attr("fill", defaultNodeColor)
      .attr("stroke", defaultNodeStroke)
      .attr("stroke-width", 2)
      .style("pointer-events", "auto")
      .style("cursor", "pointer");

    svg
      .selectAll("path.duplicate-link")
      .attr("stroke", defaultLinkColor)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    svg
      .selectAll("line.link-hover, path.duplicate-link-hover")
      .style("pointer-events", "auto")
      .style("cursor", "pointer");

    svg
      .selectAll("text.label")
      .style("opacity", 1)
      .attr("font-weight", "normal");

    return;
  }

  const activeEndpoints = new Set();
  const markedIdsSet = new Set(markedLinkIds || []);
  if (hoveredLinkId) markedIdsSet.add(hoveredLinkId);

  // 1. Straight links
  svg.selectAll("line.visible-link").each(function (d) {
    if (!d) return;
    const isMarked = markedIdsSet.has(d.id);
    const highlightColor = getLinkColorByCategory(d, palette);

    const sourceId = typeof d.source === "object" ? d.source.id : d.source;
    const targetId = typeof d.target === "object" ? d.target.id : d.target;

    if (isMarked) {
      activeEndpoints.add(sourceId);
      activeEndpoints.add(targetId);

      d3.select(this)
        .raise()
        .attr("stroke", highlightColor)
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 4.5);
    } else {
      d3.select(this)
        .attr("stroke", defaultLinkColor)
        .attr("stroke-opacity", 0.12)
        .attr("stroke-width", 1.5);
    }
  });

  // 2. Duplicate / parallel links
  svg.selectAll("path.duplicate-link").each(function (d) {
    if (!d) return;
    const isMarked = markedIdsSet.has(d.id);
    const highlightColor = getLinkColorByCategory(d, palette);

    const sourceId = typeof d.source === "object" ? d.source.id : d.source;
    const targetId = typeof d.target === "object" ? d.target.id : d.target;

    if (isMarked) {
      activeEndpoints.add(sourceId);
      activeEndpoints.add(targetId);

      d3.select(this)
        .raise()
        .attr("stroke", highlightColor)
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 4.5);
    } else {
      d3.select(this)
        .attr("stroke", defaultLinkColor)
        .attr("stroke-opacity", 0.12)
        .attr("stroke-width", 1.5);
    }
  });

  // 3. Hover Hitboxes
  svg.selectAll("line.link-hover").each(function (d) {
    const isMarked = d && markedIdsSet.has(d.id);
    d3.select(this)
      .style("pointer-events", isMarked ? "auto" : "none")
      .style("cursor", isMarked ? "pointer" : "default");
  });

  svg.selectAll("path.duplicate-link-hover").each(function (d) {
    const isMarked = d && markedIdsSet.has(d.id);
    d3.select(this)
      .style("pointer-events", isMarked ? "auto" : "none")
      .style("cursor", isMarked ? "pointer" : "default");
  });

  // 4. Nodes
  svg.selectAll("circle.node").each(function (d) {
    if (!d) return;
    const isEndpoint = activeEndpoints.has(d.id);
    if (isEndpoint) {
      d3.select(this)
        .raise()
        .style("opacity", 1)
        .attr("fill", "#fef08a")
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 3.5)
        .style("pointer-events", "auto")
        .style("cursor", "pointer");
    } else {
      d3.select(this)
        .style("opacity", 0.25)
        .attr("fill", defaultNodeColor)
        .attr("stroke", defaultNodeStroke)
        .attr("stroke-width", 2)
        .style("pointer-events", "none")
        .style("cursor", "default");
    }
  });

  // 5. Labels
  svg.selectAll("text.label").each(function (d) {
    if (!d) return;
    const isEndpoint = activeEndpoints.has(d.id);
    d3.select(this)
      .style("opacity", isEndpoint ? 1 : 0.3)
      .attr("font-weight", isEndpoint ? "bold" : "normal");
  });
}

// ===================================================================
// Function to remove all dynamically drawn parallel links
// ===================================================================
export function removeAllParallelLinks(zoomLayer) {
  if (zoomLayer) {
    zoomLayer
      .selectAll("path.duplicate-link, path.duplicate-link-hover")
      .remove();
  }
}

// ===================================================================
// Function to draw all parallel links across the entire graph
// ===================================================================
export function drawAllParallelLinks({
  zoomLayer,
  allNodes,
  filteredLinks,
  tooltip,
  palette,
  onLinkClick,
  getMarkedLinkIds,
}) {
  if (!zoomLayer) return;

  const nodeMap = new Map();
  allNodes.forEach((n) => nodeMap.set(n.id, n));

  const linkGroups = new Map();
  filteredLinks.forEach((link) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;
    const key = [sourceId, targetId].sort().join("--");

    if (!linkGroups.has(key)) {
      linkGroups.set(key, []);
    }
    linkGroups.get(key).push(link);
  });

  const svgNode = zoomLayer.node().ownerSVGElement;
  const svg = d3.select(svgNode);

  linkGroups.forEach((duplicates) => {
    if (duplicates.length === 0) return;

    const firstLink = duplicates[0];
    const sourceId =
      typeof firstLink.source === "object"
        ? firstLink.source.id
        : firstLink.source;
    const targetId =
      typeof firstLink.target === "object"
        ? firstLink.target.id
        : firstLink.target;

    const sourceNode = nodeMap.get(sourceId);
    const targetNode = nodeMap.get(targetId);

    if (!sourceNode || !targetNode) return;

    const nodeRadius = 60;
    const { x1, y1, x2, y2 } = linkPositionFromEdges(
      { source: sourceNode, target: targetNode },
      nodeRadius
    );

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return;

    const ux = dx / length;
    const uy = dy / length;
    const perpX = -uy;
    const perpY = ux;

    duplicates.forEach((linkData, index) => {
      const offset = 10 * (index - (duplicates.length - 1) / 2);
      const startX = x1 + perpX * offset;
      const startY = y1 + perpY * offset;
      const endX = x2 + perpX * offset;
      const endY = y2 + perpY * offset;

      zoomLayer
        .append("path")
        .datum(linkData)
        .attr("class", "duplicate-link")
        .attr("d", `M${startX},${startY} L${endX},${endY}`)
        .attr("fill", "none")
        .attr("stroke", palette.link)
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2)
        .style("pointer-events", "none");

      zoomLayer
        .append("path")
        .datum(linkData)
        .attr("class", "duplicate-link-hover")
        .attr("d", `M${startX},${startY} L${endX},${endY}`)
        .attr("fill", "none")
        .attr("stroke", "transparent")
        .attr("stroke-width", 14)
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d_hover) {
          const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
          if (markedIds && markedIds.size > 0 && !markedIds.has(d_hover.id)) {
            return;
          }

          const s_id = typeof d_hover.source === "object" ? d_hover.source.id : d_hover.source;
          const t_id = typeof d_hover.target === "object" ? d_hover.target.id : d_hover.target;

          svg.selectAll("circle.node").each(function (n) {
            if (!n) return;
            if (n.id === s_id || n.id === t_id) {
              d3.select(this)
                .attr("fill", palette.nodeHoverLink)
                .attr("stroke", palette.nodeHoverLinkStroke || "#facc15")
                .attr("stroke-width", 4)
                .style("opacity", 1);
            } else {
              d3.select(this).style("opacity", 0.3);
            }
          });

          // Highlight only this duplicate link, dim others
          svg.selectAll("path.duplicate-link").each(function (l) {
            if (!l) return;
            if (l.id === d_hover.id) {
              d3.select(this)
                .raise()
                .attr("stroke", getLinkColorByCategory(l, palette))
                .attr("stroke-opacity", 1.0)
                .attr("stroke-width", 5);
            } else {
              d3.select(this)
                .attr("stroke-opacity", 0.15)
                .attr("stroke-width", 2);
            }
          });

          // Remove the mouse-tracking tooltip logic
          // tooltip.attr("opacity", 0);

          // Calculate inner points near the nodes
          const edgeMargin = 25; // Pixels inward from the node edge
          const lift = 8; // Pixels perpendicular to the line to lift the text

          const localX = startX + ux * edgeMargin - perpX * lift;
          const localY = startY + uy * edgeMargin - perpY * lift;
          const remoteX = endX - ux * edgeMargin - perpX * lift;
          const remoteY = endY - uy * edgeMargin - perpY * lift;

          // Cleanup any existing temporary labels
          zoomLayer.selectAll(".edge-label-temp").remove();

          if (d_hover.local_interface) {
            zoomLayer
              .append("text")
              .attr("class", "edge-label-temp")
              .attr("x", localX)
              .attr("y", localY)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "central")
              .attr("font-size", "12px")
              .attr("font-weight", "bold")
              .attr("fill", palette.label || "#fff")
              .attr("stroke", palette.bg || "#000")
              .attr("stroke-width", 3)
              .style("paint-order", "stroke")
              .style("pointer-events", "none")
              .text(d_hover.local_interface);
          }

          if (d_hover.remote_interface) {
            zoomLayer
              .append("text")
              .attr("class", "edge-label-temp")
              .attr("x", remoteX)
              .attr("y", remoteY)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "central")
              .attr("font-size", "12px")
              .attr("font-weight", "bold")
              .attr("fill", palette.label || "#fff")
              .attr("stroke", palette.bg || "#000")
              .attr("stroke-width", 3)
              .style("paint-order", "stroke")
              .style("pointer-events", "none")
              .text(d_hover.remote_interface);
          }
        })
        .on("mousemove", function (event) {
          const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
          if (markedIds && markedIds.size > 0 && !markedIds.has(linkData.id)) {
            return;
          }
          // Intentionally do nothing on mousemove now since the labels are fixed to the edges
        })
        .on("mouseleave", function () {
          tooltip.attr("opacity", 0);
          zoomLayer.selectAll(".edge-label-temp").remove();
          const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
          if (markedIds && markedIds.size > 0) {
            applyMarkedState({ svg, markedLinkIds: markedIds, palette });
            return;
          }

          svg
            .selectAll("circle.node")
            .attr("fill", palette.node)
            .attr("stroke", palette.stroke)
            .attr("stroke-width", 2)
            .style("opacity", 0.9);

          svg
            .selectAll("path.duplicate-link")
            .attr("stroke", palette.link)
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 2);
        })
        .on("click", function (event, d_clicked) {
          if (onLinkClick) {
            const payload = createLinkPopupPayload(d_clicked);
            if (payload) onLinkClick(payload);
          }
          event.stopPropagation();
        });
    });
  });
}

// ===================================================================
// Node Mouse Over Handler (Adjacency Index Fast Lookup)
// ===================================================================
export function handleNodeMouseOver(
  d_node,
  linkSelection,
  palette,
  getMarkedLinkIds,
  graphIndex
) {
  if (!d_node || !d_node.id) return;
  const nodeId = d_node.id;
  const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
  const hasMarked = markedIds && markedIds.size > 0;

  // Check if this node is an endpoint of any marked link
  if (hasMarked) {
    const nodeLinks = graphIndex?.linksByNode?.get(nodeId) || [];
    const hasActiveMarked = nodeLinks.some((l) => markedIds.has(l.id));
    if (!hasActiveMarked) return;
  }

  const svgNode = linkSelection?.node()?.ownerSVGElement;
  const svg = svgNode ? d3.select(svgNode) : d3.select("svg");

  const connectedLinkIds = new Set(
    (graphIndex?.linksByNode?.get(nodeId) || [])
      .filter((l) => !hasMarked || markedIds.has(l.id))
      .map((l) => l.id)
  );

  const neighborNodeIds = new Set();
  (graphIndex?.linksByNode?.get(nodeId) || []).forEach((l) => {
    if (hasMarked && !markedIds.has(l.id)) return;
    const sId = typeof l.source === "object" ? l.source.id : l.source;
    const tId = typeof l.target === "object" ? l.target.id : l.target;
    if (sId === nodeId && tId) neighborNodeIds.add(tId);
    if (tId === nodeId && sId) neighborNodeIds.add(sId);
  });

  // 1. Highlight connected straight links
  svg.selectAll("line.visible-link").each(function (l) {
    if (!l) return;
    const isConnected = connectedLinkIds.has(l.id);
    const isMarked = !hasMarked || markedIds.has(l.id);

    if (isConnected) {
      d3.select(this)
        .attr("stroke", getLinkColorByCategory(l, palette))
        .attr("stroke-opacity", 1.0)
        .attr("stroke-width", 5);
    } else {
      d3.select(this)
        .attr(
          "stroke",
          hasMarked && isMarked
            ? getLinkColorByCategory(l, palette)
            : palette.link
        )
        .attr("stroke-opacity", hasMarked && isMarked ? 0.35 : 0.1)
        .attr("stroke-width", hasMarked && isMarked ? 3 : 1.5);
    }
  });

  // 2. Duplicate / parallel links
  svg.selectAll("path.duplicate-link").each(function (l) {
    if (!l) return;
    const isConnected = connectedLinkIds.has(l.id);
    const isMarked = !hasMarked || markedIds.has(l.id);

    if (isConnected) {
      d3.select(this)
        .attr("stroke", getLinkColorByCategory(l, palette))
        .attr("stroke-opacity", 1.0)
        .attr("stroke-width", 5);
    } else {
      d3.select(this)
        .attr(
          "stroke",
          hasMarked && isMarked
            ? getLinkColorByCategory(l, palette)
            : palette.link
        )
        .attr("stroke-opacity", hasMarked && isMarked ? 0.35 : 0.1)
        .attr("stroke-width", hasMarked && isMarked ? 3 : 1.5);
    }
  });

  // 3. Highlight hovered node & neighbors
  svg.selectAll("circle.node").each(function (n) {
    if (!n) return;
    if (n.id === nodeId) {
      d3.select(this)
        .attr("fill", palette.nodeHoverDirect || "#1d9bb4")
        .attr("stroke", palette.nodeHoverLinkStroke || "#facc15")
        .attr("stroke-width", 4.5)
        .style("opacity", 1);
    } else if (neighborNodeIds.has(n.id)) {
      d3.select(this)
        .attr("fill", palette.nodeHoverLink || "#fde68a")
        .attr("stroke", palette.nodeHoverLinkStroke || "#facc15")
        .attr("stroke-width", 3.5)
        .style("opacity", 1);
    } else {
      d3.select(this)
        .attr("fill", palette.node)
        .attr("stroke", palette.stroke)
        .attr("stroke-width", 2)
        .style("opacity", hasMarked ? 0.15 : 0.25);
    }
  });

  // 4. Labels
  svg.selectAll("text.label").each(function (n) {
    if (!n) return;
    const isRelevant = n.id === nodeId || neighborNodeIds.has(n.id);
    d3.select(this)
      .style("opacity", isRelevant ? 1 : 0.25)
      .attr("font-weight", isRelevant ? "bold" : "normal");
  });
}

// ===================================================================
// Node Mouse Out Handler
// ===================================================================
export function handleNodeMouseOut(
  d_node,
  linkSelection,
  palette,
  getMarkedLinkIds
) {
  const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
  const svgNode = linkSelection?.node()?.ownerSVGElement;
  const svg = svgNode ? d3.select(svgNode) : d3.select("svg");

  if (markedIds && markedIds.size > 0) {
    applyMarkedState({ svg, markedLinkIds: markedIds, palette });
    return;
  }

  // Restore everything instantly
  svg
    .selectAll("line.visible-link")
    .attr("stroke", palette.link)
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 2)
    .style("opacity", 1);

  svg
    .selectAll("path.duplicate-link")
    .attr("stroke", palette.link)
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 2);

  svg
    .selectAll("circle.node")
    .attr("fill", palette.node)
    .attr("stroke", palette.stroke)
    .attr("stroke-width", 2)
    .style("opacity", 0.9);

  svg
    .selectAll("text.label")
    .style("opacity", 1)
    .attr("font-weight", "normal");
}

// ===================================================================
// Draw temporary parallel links for a specific source/target pair
// ===================================================================
export function drawTempParallelLinks({
  zoomLayer,
  sourceId,
  targetId,
  allLinks,
  allNodes,
  palette,
  tooltip,
  onLinkClick,
}) {
  if (!zoomLayer) return;

  const duplicates = allLinks.filter(l => {
    const ls = typeof l.source === "object" ? l.source.id : l.source;
    const lt = typeof l.target === "object" ? l.target.id : l.target;
    return (ls === sourceId && lt === targetId) || (ls === targetId && lt === sourceId);
  });

  if (duplicates.length <= 1) return;

  const nodeMap = new Map();
  allNodes.forEach((n) => nodeMap.set(n.id, n));

  const sourceNode = nodeMap.get(sourceId);
  const targetNode = nodeMap.get(targetId);
  if (!sourceNode || !targetNode) return;

  const nodeRadius = 60;
  const { x1, y1, x2, y2 } = linkPositionFromEdges(
    { source: sourceNode, target: targetNode },
    nodeRadius
  );

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return;

  const ux = dx / length;
  const uy = dy / length;
  const perpX = -uy;
  const perpY = ux;

  // Hide the straight visible link for this pair
  zoomLayer.selectAll("line.visible-link").filter(l => {
    if (!l) return false;
    const ls = typeof l.source === "object" ? l.source.id : l.source;
    const lt = typeof l.target === "object" ? l.target.id : l.target;
    return (ls === sourceId && lt === targetId) || (ls === targetId && lt === sourceId);
  }).style("opacity", 0);

  // Dynamically increase the hitbox of the straight line so the mouse doesn't fall into the gaps
  const maxOffset = 10 * ((duplicates.length - 1) / 2);
  const hoverWidth = maxOffset * 2 + 30; // 30 is base padding
  zoomLayer.selectAll("line.link-hover").filter(l => {
    if (!l) return false;
    const ls = typeof l.source === "object" ? l.source.id : l.source;
    const lt = typeof l.target === "object" ? l.target.id : l.target;
    return (ls === sourceId && lt === targetId) || (ls === targetId && lt === sourceId);
  }).attr("stroke-width", Math.max(20, hoverWidth));

  const svgNode = zoomLayer.node().ownerSVGElement;
  const svg = d3.select(svgNode);

  duplicates.forEach((linkData, index) => {
    const offset = 10 * (index - (duplicates.length - 1) / 2);
    const startX = x1 + perpX * offset;
    const startY = y1 + perpY * offset;
    const endX = x2 + perpX * offset;
    const endY = y2 + perpY * offset;

    zoomLayer
      .append("path")
      .datum(linkData)
      .attr("class", "temp-duplicate-link")
      .attr("d", `M${startX},${startY} L${endX},${endY}`)
      .attr("fill", "none")
      .attr("stroke", getLinkColorByCategory(linkData, palette))
      .attr("stroke-width", 3)
      .style("pointer-events", "stroke")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d_temp) {
        d3.select(this).attr("stroke", getLinkColorByCategory(d_temp, palette)).attr("stroke-width", 5);

        // Calculate inner points near the nodes
        const edgeMargin = 25; // Pixels inward from the node edge
        const lift = 8; // Pixels perpendicular to the line to lift the text

        const localX = startX + ux * edgeMargin - perpX * lift;
        const localY = startY + uy * edgeMargin - perpY * lift;
        const remoteX = endX - ux * edgeMargin - perpX * lift;
        const remoteY = endY - uy * edgeMargin - perpY * lift;

        // Cleanup any existing temporary labels
        zoomLayer.selectAll(".edge-label-temp").remove();

        if (d_temp.local_interface) {
          zoomLayer
            .append("text")
            .attr("class", "edge-label-temp")
            .attr("x", localX)
            .attr("y", localY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("fill", palette.label || "#fff")
            .attr("stroke", palette.bg || "#000")
            .attr("stroke-width", 3)
            .style("paint-order", "stroke")
            .style("pointer-events", "none")
            .text(d_temp.local_interface);
        }

        if (d_temp.remote_interface) {
          zoomLayer
            .append("text")
            .attr("class", "edge-label-temp")
            .attr("x", remoteX)
            .attr("y", remoteY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("fill", palette.label || "#fff")
            .attr("stroke", palette.bg || "#000")
            .attr("stroke-width", 3)
            .style("paint-order", "stroke")
            .style("pointer-events", "none")
            .text(d_temp.remote_interface);
        }
      })
      .on("mousemove", function (event) {
        // Intentionally left blank as labels are static
      })
      .on("mouseout", function (event) {
        d3.select(this).attr("stroke-width", 3);
        zoomLayer.selectAll(".edge-label-temp").remove();

        if (event && event.relatedTarget && event.relatedTarget.classList &&
          (event.relatedTarget.classList.contains("temp-duplicate-link") ||
            event.relatedTarget.classList.contains("link-hover"))) {
          return;
        }

        svg.selectAll(".temp-duplicate-link").remove();
        svg.selectAll("line.visible-link").style("opacity", 1);
        if (tooltip) tooltip.attr("opacity", 0);
      })
      .on("click", function (event, d_temp) {
        if (onLinkClick) {
          onLinkClick(createLinkPopupPayload(d_temp));
        }
        event.stopPropagation();
      });
  });
}

// ===================================================================
// Straight Link Mouse Over Handler
// ===================================================================
function handleMouseOver(
  d_link,
  linkSelection,
  tooltip,
  palette,
  getMarkedLinkIds,
  event,
  zoomLayer,
  filteredLinks,
  allNodes,
  onLinkClick
) {
  if (!d_link) return;
  const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
  if (markedIds && markedIds.size > 0 && !markedIds.has(d_link.id)) {
    return;
  }

  const svgNode = linkSelection?.node()?.ownerSVGElement;
  const svg = svgNode ? d3.select(svgNode) : d3.select("svg");

  const sId = typeof d_link.source === "object" ? d_link.source.id : d_link.source;
  const tId = typeof d_link.target === "object" ? d_link.target.id : d_link.target;

  // Temporarily show parallel links for this hovered pair
  if (zoomLayer && filteredLinks && allNodes) {
    drawTempParallelLinks({
      zoomLayer,
      sourceId: sId,
      targetId: tId,
      allLinks: filteredLinks,
      allNodes,
      palette,
      tooltip,
      onLinkClick,
    });
  }

  // Highlight hovered link, dim others
  svg.selectAll("line.visible-link").each(function (l) {
    if (!l) return;
    if (l.id === d_link.id) {
      d3.select(this)
        .attr("stroke", getLinkColorByCategory(l, palette))
        .attr("stroke-opacity", 1.0)
        .attr("stroke-width", 5);
    } else {
      d3.select(this)
        .attr("stroke-opacity", 0.12)
        .attr("stroke-width", 1.5);
    }
  });

  // Highlight endpoint nodes
  svg.selectAll("circle.node").each(function (n) {
    if (!n) return;
    if (n.id === sId || n.id === tId) {
      d3.select(this)
        .attr("fill", palette.nodeHoverLink || "#fde68a")
        .attr("stroke", palette.nodeHoverLinkStroke || "#facc15")
        .attr("stroke-width", 4)
        .style("opacity", 1);
    } else {
      d3.select(this).style("opacity", 0.25);
    }
  });

  // Tooltip tracking removed in favor of edge labels
}

// ===================================================================
// Straight Link Mouse Out Handler
// ===================================================================
function handleMouseOut(linkSelection, tooltip, palette, getMarkedLinkIds, event) {
  // If moving to a temporary duplicate link, do NOT tear down!
  if (
    event &&
    event.relatedTarget &&
    event.relatedTarget.classList &&
    event.relatedTarget.classList.contains("temp-duplicate-link")
  ) {
    return;
  }

  tooltip.attr("opacity", 0);
  const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
  const svgNode = linkSelection?.node()?.ownerSVGElement;
  const svg = svgNode ? d3.select(svgNode) : d3.select("svg");

  // Remove temporary parallel links
  svg.selectAll(".temp-duplicate-link").remove();

  // Restore the straight link hover area
  svg.selectAll("line.link-hover").attr("stroke-width", 20);

  if (markedIds && markedIds.size > 0) {
    applyMarkedState({ svg, markedLinkIds: markedIds, palette });
    return;
  }

  svg
    .selectAll("line.visible-link")
    .attr("stroke", palette.link)
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 2)
    .style("opacity", 1);

  svg
    .selectAll("circle.node")
    .attr("fill", palette.node)
    .attr("stroke", palette.stroke)
    .attr("stroke-width", 2)
    .style("opacity", 0.9);

  svg
    .selectAll("text.label")
    .style("opacity", 1)
    .attr("font-weight", "normal");
}

// ===================================================================
// Main Setup Interactions function
// ===================================================================
export function setupInteractions({
  link,
  linkHover,
  filteredLinks,
  node,
  tooltip,
  palette,
  zoomLayer,
  onLinkClick,
  getMarkedLinkIds,
}) {
  if (!zoomLayer || !zoomLayer.node() || !linkHover || !linkHover.size()) {
    return;
  }

  const svgNode = zoomLayer.node().ownerSVGElement;
  const svg = d3.select(svgNode);

  // Build Adjacency Graph Index
  const linksByNode = new Map();
  (filteredLinks || []).forEach((l) => {
    const sId = typeof l.source === "object" ? l.source.id : l.source;
    const tId = typeof l.target === "object" ? l.target.id : l.target;
    if (sId) {
      if (!linksByNode.has(sId)) linksByNode.set(sId, []);
      linksByNode.get(sId).push(l);
    }
    if (tId) {
      if (!linksByNode.has(tId)) linksByNode.set(tId, []);
      linksByNode.get(tId).push(l);
    }
  });

  const graphIndex = { linksByNode };

  // Node hover interactions
  if (node && node.size()) {
    node
      .on("mouseover", function (event, d_node) {
        handleNodeMouseOver(
          d_node,
          link,
          palette,
          getMarkedLinkIds,
          graphIndex
        );
      })
      .on("mouseout", function (event, d_node) {
        handleNodeMouseOut(d_node, link, palette, getMarkedLinkIds);
      });
  }

  // Link hover interactions
  linkHover
    .on("mouseover", function (event, d_hovered) {
      handleMouseOver(
        d_hovered,
        link,
        tooltip,
        palette,
        getMarkedLinkIds,
        event,
        zoomLayer,
        filteredLinks,
        node ? node.data() : [],
        onLinkClick
      );
    })
    .on("mousemove", function (event, d_hovered) {
      const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
      if (markedIds && markedIds.size > 0 && !markedIds.has(d_hovered.id)) {
        return;
      }
      const [px, py] = d3.pointer(event, svgNode);
      tooltip.attr("x", px + 12).attr("y", py - 12);
    })
    .on("mouseout", function (event) {
      handleMouseOut(link, tooltip, palette, getMarkedLinkIds, event);
    })
    .on("click", function (event, d_clicked) {
      if (onLinkClick) {
        const payload = createLinkPopupPayload(d_clicked);
        if (payload) onLinkClick(payload);
      }
      event.stopPropagation();
    });

  // Global SVG pointerleave safety check to prevent any stuck hover state
  svg.on("pointerleave.clearHover", function () {
    handleNodeMouseOut(null, link, palette, getMarkedLinkIds);
  });
}
