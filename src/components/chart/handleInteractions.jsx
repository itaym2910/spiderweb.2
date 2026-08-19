// src/chart/handleInteractions.jsx
import { linkPositionFromEdges, normalizeLinkStatus } from "./drawHelpers";
import * as d3 from "d3";

// --- Helper function to create payload for link popups ---
export function createLinkPopupPayload(linkDataObject) {
  if (!linkDataObject) return null;

  const sourceId =
    typeof linkDataObject.source === "object" && linkDataObject.source !== null
      ? linkDataObject.source.id
      : linkDataObject.source;
  const targetId =
    typeof linkDataObject.target === "object" && linkDataObject.target !== null
      ? linkDataObject.target.id
      : linkDataObject.target;

  const popupId =
    linkDataObject.id ||
    `${sourceId}-${targetId}-${Math.random().toString(16).slice(2)}`;

  return {
    ...linkDataObject,
    type: "link",
    id: popupId,
    linkId: linkDataObject.id,
    sourceNode: sourceId,
    targetNode: targetId,
    name:
      linkDataObject.name ||
      linkDataObject.id ||
      `Link ${sourceId}-${targetId}`,
    status: linkDataObject.status || "N/A",
    linkBandwidth:
      linkDataObject.bandwidth || linkDataObject.linkBandwidth || "N/A",
    latency: linkDataObject.latency || "N/A",
    utilization: linkDataObject.utilization || "N/A",
    linkDescription:
      linkDataObject.description || linkDataObject.linkDescription || "N/A",
    sourceInterface: linkDataObject.sourceInterface || "N/A",
    targetInterface: linkDataObject.targetInterface || "N/A",
    encapsulation: linkDataObject.encapsulation || "N/A",
    lastFlap: linkDataObject.lastFlap || "N/A",
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
      .attr("stroke-width", 2);

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
      .attr("stroke", (d) => getLinkColorByCategory(d, palette))
      .attr("stroke-opacity", 1.0)
      .attr("stroke-width", 3);

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
        .attr("stroke", getLinkColorByCategory(linkData, palette))
        .attr("stroke-width", 3)
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

          const [px, py] = d3.pointer(event, svgNode);
          tooltip
            .attr("x", px + 12)
            .attr("y", py - 12)
            .text(d_hover.id)
            .attr("opacity", 1);
        })
        .on("mousemove", function (event) {
          const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
          if (markedIds && markedIds.size > 0 && !markedIds.has(linkData.id)) {
            return;
          }
          const [px, py] = d3.pointer(event, svgNode);
          tooltip.attr("x", px + 12).attr("y", py - 12);
        })
        .on("mouseleave", function () {
          tooltip.attr("opacity", 0);
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
            .attr("stroke", (d) => getLinkColorByCategory(d, palette))
            .attr("stroke-opacity", 1.0)
            .attr("stroke-width", 3);
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
        .raise()
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
        .raise()
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
        .raise()
        .attr("fill", palette.nodeHoverDirect || "#1d9bb4")
        .attr("stroke", palette.nodeHoverLinkStroke || "#facc15")
        .attr("stroke-width", 4.5)
        .style("opacity", 1);
    } else if (neighborNodeIds.has(n.id)) {
      d3.select(this)
        .raise()
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
    .attr("stroke-width", 2);

  svg
    .selectAll("path.duplicate-link")
    .attr("stroke", (d) => getLinkColorByCategory(d, palette))
    .attr("stroke-opacity", 1.0)
    .attr("stroke-width", 3);

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
// Straight Link Mouse Over Handler
// ===================================================================
function handleMouseOver(
  d_link,
  linkSelection,
  tooltip,
  palette,
  getMarkedLinkIds,
  event
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

  // Highlight hovered link, dim others
  svg.selectAll("line.visible-link").each(function (l) {
    if (!l) return;
    if (l.id === d_link.id) {
      d3.select(this)
        .raise()
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
        .raise()
        .attr("fill", palette.nodeHoverLink || "#fde68a")
        .attr("stroke", palette.nodeHoverLinkStroke || "#facc15")
        .attr("stroke-width", 4)
        .style("opacity", 1);
    } else {
      d3.select(this).style("opacity", 0.25);
    }
  });

  if (event) {
    const [px, py] = d3.pointer(event, svgNode);
    tooltip
      .attr("x", px + 12)
      .attr("y", py - 12)
      .text(d_link.id)
      .attr("opacity", 1);
  }
}

// ===================================================================
// Straight Link Mouse Out Handler
// ===================================================================
function handleMouseOut(linkSelection, tooltip, palette, getMarkedLinkIds) {
  tooltip.attr("opacity", 0);
  const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
  const svgNode = linkSelection?.node()?.ownerSVGElement;
  const svg = svgNode ? d3.select(svgNode) : d3.select("svg");

  if (markedIds && markedIds.size > 0) {
    applyMarkedState({ svg, markedLinkIds: markedIds, palette });
    return;
  }

  svg
    .selectAll("line.visible-link")
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
      .on("mouseenter.nodeHover", function (event, d_node) {
        handleNodeMouseOver(
          d_node,
          link,
          palette,
          getMarkedLinkIds,
          graphIndex
        );
      })
      .on("mouseleave.nodeHover", function (event, d_node) {
        handleNodeMouseOut(d_node, link, palette, getMarkedLinkIds);
      });
  }

  // Link hover interactions
  linkHover
    .on("mouseenter", function (event, d_hovered) {
      handleMouseOver(
        d_hovered,
        link,
        tooltip,
        palette,
        getMarkedLinkIds,
        event
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
    .on("mouseleave", function () {
      handleMouseOut(link, tooltip, palette, getMarkedLinkIds);
    })
    .on("click", function (event, d_clicked) {
      if (onLinkClick) {
        const payload = createLinkPopupPayload(d_clicked);
        if (payload) onLinkClick(payload);
      }
      event.stopPropagation();
    });
}
