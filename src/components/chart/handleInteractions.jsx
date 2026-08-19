import { linkPositionFromEdges, normalizeLinkStatus } from "./drawHelpers";
import * as d3 from "d3";

// --- Helper function to create payload for link popups ---
function createLinkPopupPayload(linkDataObject) {
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
// Helper function to apply / restore marked links & nodes state
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
      .transition()
      .duration(150)
      .attr("stroke", defaultLinkColor)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    svg
      .selectAll("circle.node")
      .transition()
      .duration(150)
      .style("opacity", 0.9)
      .attr("fill", defaultNodeColor)
      .attr("stroke", defaultNodeStroke)
      .attr("stroke-width", 2)
      .style("pointer-events", "auto")
      .style("cursor", "pointer");

    svg
      .selectAll("path.duplicate-link")
      .transition()
      .duration(150)
      .attr("stroke", (d) => getLinkColorByCategory(d, palette))
      .attr("stroke-opacity", 1.0)
      .attr("stroke-width", 3);

    svg
      .selectAll("line.link-hover, path.duplicate-link-hover")
      .style("pointer-events", "auto")
      .style("cursor", "pointer");

    svg
      .selectAll("text.label")
      .transition()
      .duration(150)
      .style("opacity", 1)
      .attr("font-weight", "normal");

    return;
  }

  const activeEndpoints = new Set();
  const markedIdsSet = new Set(markedLinkIds || []);
  if (hoveredLinkId) markedIdsSet.add(hoveredLinkId);

  // 1. Visible straight links
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
        .transition()
        .duration(150)
        .attr("stroke", highlightColor)
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 4.5);
    } else {
      d3.select(this)
        .transition()
        .duration(150)
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
        .transition()
        .duration(150)
        .attr("stroke", highlightColor)
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 4.5);
    } else {
      d3.select(this)
        .transition()
        .duration(150)
        .attr("stroke", defaultLinkColor)
        .attr("stroke-opacity", 0.12)
        .attr("stroke-width", 1.5);
    }
  });

  // 3. Hover hitboxes: only marked links can be hovered
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

  // 4. Nodes: only endpoints of marked links can be hovered
  svg.selectAll("circle.node").each(function (d) {
    if (!d) return;
    const isEndpoint = activeEndpoints.has(d.id);
    if (isEndpoint) {
      d3.select(this)
        .raise()
        .transition()
        .duration(150)
        .style("opacity", 1)
        .attr("fill", "#fef08a")
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 3.5)
        .style("pointer-events", "auto")
        .style("cursor", "pointer");
    } else {
      d3.select(this)
        .transition()
        .duration(150)
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
      .transition()
      .duration(150)
      .style("opacity", isEndpoint ? 1 : 0.3)
      .attr("font-weight", isEndpoint ? "bold" : "normal");
  });
}

function handleMouseOut(
  d_hovered_orig,
  linkSelection,
  tooltip,
  palette,
  getMarkedLinkIds
) {
  tooltip.attr("opacity", 0);
  d3.selectAll("path.duplicate-link").remove();
  d3.selectAll("path.duplicate-link-hover").remove();

  const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
  if (markedIds && markedIds.size > 0) {
    // If marked links are active, restore the marked state
    const svgNode = linkSelection ? linkSelection.node() : null;
    const svg = svgNode ? d3.select(svgNode.ownerSVGElement || svgNode.closest("svg")) : null;
    if (svg && svg.node()) {
      applyMarkedState({ svg, markedLinkIds: markedIds, palette });
      return;
    }
  }

  if (
    !d_hovered_orig ||
    typeof d_hovered_orig.source === "undefined" ||
    typeof d_hovered_orig.target === "undefined"
  ) {
    if (linkSelection) {
      linkSelection
        .attr("stroke", palette.link)
        .attr("stroke-opacity", 0.6)
        .style("pointer-events", "auto")
        .attr("stroke-width", 2);
    }
    d3.selectAll("circle.node")
      .attr("fill", palette.node)
      .attr("stroke", palette.stroke)
      .attr("stroke-width", 2);
    return;
  }

  const sourceId =
    typeof d_hovered_orig.source === "object" && d_hovered_orig.source !== null
      ? d_hovered_orig.source.id
      : d_hovered_orig.source;
  const targetId =
    typeof d_hovered_orig.target === "object" && d_hovered_orig.target !== null
      ? d_hovered_orig.target.id
      : d_hovered_orig.target;

  if (typeof sourceId === "undefined" || typeof targetId === "undefined") {
    if (linkSelection) {
      linkSelection.attr("stroke-opacity", 0.6).style("pointer-events", "auto");
    }
    d3.selectAll("circle.node")
      .attr("fill", palette.node)
      .attr("stroke", palette.stroke);
    return;
  }

  const key_unhovered = [sourceId, targetId].sort().join("--");

  if (linkSelection) {
    linkSelection.each(function (l_straight) {
      if (
        !l_straight ||
        typeof l_straight.source === "undefined" ||
        typeof l_straight.target === "undefined"
      ) {
        return;
      }
      const s_id =
        typeof l_straight.source === "object" && l_straight.source !== null
          ? l_straight.source.id
          : l_straight.source;
      const t_id =
        typeof l_straight.target === "object" && l_straight.target !== null
          ? l_straight.target.id
          : l_straight.target;

      if (typeof s_id === "undefined" || typeof t_id === "undefined") {
        return;
      }
      const straightKey = [s_id, t_id].sort().join("--");
      if (straightKey === key_unhovered) {
        d3.select(this)
          .attr("stroke", palette.link)
          .attr("stroke-opacity", 0.6)
          .style("pointer-events", "auto")
          .attr("stroke-width", 2);
      }
    });
  }

  d3.selectAll("circle.node")
    .filter((n) => n.id === sourceId || n.id === targetId)
    .attr("fill", palette.node)
    .attr("stroke", palette.stroke)
    .attr("stroke-width", 2);
}

function handleMouseOver(
  d_hovered_orig,
  allNodes,
  filteredLinks,
  linkSelection,
  zoomLayer,
  tooltip,
  palette,
  onLinkClick,
  getMarkedLinkIds
) {
  const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
  if (markedIds && markedIds.size > 0 && !markedIds.has(d_hovered_orig.id)) {
    return;
  }

  const sourceId =
    typeof d_hovered_orig.source === "object" && d_hovered_orig.source !== null
      ? d_hovered_orig.source.id
      : d_hovered_orig.source;
  const targetId =
    typeof d_hovered_orig.target === "object" && d_hovered_orig.target !== null
      ? d_hovered_orig.target.id
      : d_hovered_orig.target;

  if (typeof sourceId === "undefined" || typeof targetId === "undefined") {
    return;
  }

  const key = [sourceId, targetId].sort().join("--");

  linkSelection.each(function (l_straight) {
    const s =
      typeof l_straight.source === "object" && l_straight.source !== null
        ? l_straight.source.id
        : l_straight.source;
    const t =
      typeof l_straight.target === "object" && l_straight.target !== null
        ? l_straight.target.id
        : l_straight.target;

    if (typeof s === "undefined" || typeof t === "undefined") {
      return;
    }
    const straightKey = [s, t].sort().join("--");
    if (straightKey === key) {
      d3.select(this).attr("stroke-opacity", 0).style("pointer-events", "none");
    }
  });

  d3.selectAll("circle.node")
    .filter((n) => n.id === sourceId || n.id === targetId)
    .attr("fill", "#fde68a")
    .attr("stroke", "#facc15")
    .attr("stroke-width", 4);

  zoomLayer.selectAll("path.duplicate-link").remove();
  zoomLayer.selectAll("path.duplicate-link-hover").remove();

  const duplicates = filteredLinks.filter((l) => {
    const s =
      typeof l.source === "object" && l.source !== null
        ? l.source.id
        : l.source;
    const t =
      typeof l.target === "object" && l.target !== null
        ? l.target.id
        : l.target;
    if (typeof s === "undefined" || typeof t === "undefined") return false;
    return [s, t].sort().join("--") === key;
  });

  const sourceNode = allNodes.find((n) => n.id === sourceId);
  const targetNode = allNodes.find((n) => n.id === targetId);

  if (!sourceNode || !targetNode) {
    return;
  }

  const nodeRadius = 60;
  const { x1, y1, x2, y2 } = linkPositionFromEdges(
    { source: sourceNode, target: targetNode },
    nodeRadius
  );

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) {
    return;
  }

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
      // USE THE NEW COLOR HELPER
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
      .attr("stroke-width", 12)
      .style("cursor", "pointer")
      .on("mousemove", function (event, d_mousemove) {
        tooltip
          .attr("x", event.offsetX + 10)
          .attr("y", event.offsetY - 10)
          .text(d_mousemove.id) // This shows the original link ID in tooltip
          .attr("opacity", 1);
      })
      .on("mouseout", function (event, d_curved_mouseout) {
        tooltip.attr("opacity", 0);

        const relatedTarget = event.relatedTarget;
        let shouldCleanupFromCurved = true;

        const currentCurvedSourceId =
          typeof d_curved_mouseout.source === "object" &&
          d_curved_mouseout.source !== null
            ? d_curved_mouseout.source.id
            : d_curved_mouseout.source;
        const currentCurvedTargetId =
          typeof d_curved_mouseout.target === "object" &&
          d_curved_mouseout.target !== null
            ? d_curved_mouseout.target.id
            : d_curved_mouseout.target;

        if (
          typeof currentCurvedSourceId === "undefined" ||
          typeof currentCurvedTargetId === "undefined"
        ) {
          // If IDs are missing, assume cleanup is needed
        } else {
          const currentCurvedKey = [
            currentCurvedSourceId,
            currentCurvedTargetId,
          ]
            .sort()
            .join("--");

          if (relatedTarget) {
            const rtSelection = d3.select(relatedTarget);
            const rtData = rtSelection.datum();

            if (
              rtSelection.classed("duplicate-link-hover") &&
              rtData &&
              typeof rtData.source !== "undefined" &&
              typeof rtData.target !== "undefined"
            ) {
              const relatedCurvedSourceId =
                typeof rtData.source === "object" && rtData.source !== null
                  ? rtData.source.id
                  : rtData.source;
              const relatedCurvedTargetId =
                typeof rtData.target === "object" && rtData.target !== null
                  ? rtData.target.id
                  : rtData.target;
              if (
                typeof relatedCurvedSourceId !== "undefined" &&
                typeof relatedCurvedTargetId !== "undefined"
              ) {
                const relatedCurvedKey = [
                  relatedCurvedSourceId,
                  relatedCurvedTargetId,
                ]
                  .sort()
                  .join("--");
                if (currentCurvedKey === relatedCurvedKey) {
                  shouldCleanupFromCurved = false;
                }
              }
            } else if (
              rtSelection.classed("link-hover") &&
              rtData &&
              typeof rtData.source !== "undefined" &&
              typeof rtData.target !== "undefined"
            ) {
              const relatedStraightSourceId =
                typeof rtData.source === "object" && rtData.source !== null
                  ? rtData.source.id
                  : rtData.source;
              const relatedStraightTargetId =
                typeof rtData.target === "object" && rtData.target !== null
                  ? rtData.target.id
                  : rtData.target;
              if (
                typeof relatedStraightSourceId !== "undefined" &&
                typeof relatedStraightTargetId !== "undefined"
              ) {
                const relatedStraightKey = [
                  relatedStraightSourceId,
                  relatedStraightTargetId,
                ]
                  .sort()
                  .join("--");
                if (currentCurvedKey === relatedStraightKey) {
                  shouldCleanupFromCurved = false;
                }
              }
            }
          }
        }

        if (shouldCleanupFromCurved) {
          handleMouseOut(d_curved_mouseout, linkSelection, tooltip, palette);
        }
      })
      .on("click", function (event, d_clicked_duplicate_link) {
        if (onLinkClick) {
          const payload = createLinkPopupPayload(d_clicked_duplicate_link);
          if (payload) {
            onLinkClick(payload);
          }
        }
        console.log(
          "[Link Click] Curved/Duplicate link ID:",
          d_clicked_duplicate_link.id // This is the original link ID
        );
        event.stopPropagation();
      });
  });
}

// ===================================================================
// NEW: Function to remove all dynamically drawn parallel links
// ===================================================================
export function removeAllParallelLinks(zoomLayer) {
  if (zoomLayer) {
    zoomLayer
      .selectAll("path.duplicate-link, path.duplicate-link-hover")
      .remove();
  }
}

// ===================================================================
// NEW: Function to draw all parallel links across the entire graph
// ===================================================================
export function drawAllParallelLinks({
  zoomLayer,
  allNodes,
  filteredLinks,
  tooltip,
  palette,
  onLinkClick,
  linkSelection,
  getMarkedLinkIds,
}) {
  if (!zoomLayer) return;

  // 1. Group all links by the pair of nodes they connect
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

  // 2. Iterate over each group and draw the parallel links
  linkGroups.forEach((duplicates) => {
    if (duplicates.length < 1) return; // Or < 2 if you only want to fan out actual duplicates

    const firstLink = duplicates[0];
    const sourceId =
      typeof firstLink.source === "object"
        ? firstLink.source.id
        : firstLink.source;
    const targetId =
      typeof firstLink.target === "object"
        ? firstLink.target.id
        : firstLink.target;

    const sourceNode = allNodes.find((n) => n.id === sourceId);
    const targetNode = allNodes.find((n) => n.id === targetId);

    if (!sourceNode || !targetNode) return;

    // --- This entire drawing block is adapted from handleMouseOver ---
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
        // USE THE NEW COLOR HELPER
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
        .attr("stroke-width", 12)
        .style("cursor", "pointer")
        // NEW: Highlight connected nodes and color ONLY the hovered link on mouseover
        .on("mouseover", function (event, d_mouseover) {
          const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
          if (markedIds && markedIds.size > 0 && !markedIds.has(d_mouseover.id)) {
            return;
          }

          const s_id = d_mouseover.source.id;
          const t_id = d_mouseover.target.id;
          d3.selectAll("circle.node")
            .filter((n) => n.id === s_id || n.id === t_id)
            .attr("fill", palette.nodeHoverLink)
            .attr("stroke", palette.nodeHoverLinkStroke)
            .attr("stroke-width", 4);

          // Show only the hovered duplicate link colored, fade out all others
          d3.selectAll("path.duplicate-link")
            .attr("stroke", (d) =>
              d.id === d_mouseover.id
                ? getLinkColorByCategory(d, palette)
                : palette.link
            )
            .attr("stroke-opacity", (d) => (d.id === d_mouseover.id ? 1.0 : 0.15))
            .attr("stroke-width", (d) => (d.id === d_mouseover.id ? 4 : 2));
        })
        .on("mousemove", function (event, d_mousemove) {
          const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
          if (markedIds && markedIds.size > 0 && !markedIds.has(d_mousemove.id)) {
            return;
          }
          tooltip
            .attr("x", event.offsetX + 10)
            .attr("y", event.offsetY - 10)
            .text(d_mousemove.id)
            .attr("opacity", 1);
        })
        // MODIFIED: Un-highlight nodes and restore link coloring on mouseout
        .on("mouseout", function (event, d_mouseout) {
          tooltip.attr("opacity", 0);
          const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
          if (markedIds && markedIds.size > 0) {
            const svg = zoomLayer ? d3.select(zoomLayer.node().ownerSVGElement) : null;
            if (svg && svg.node()) {
              applyMarkedState({ svg, markedLinkIds: markedIds, palette });
              return;
            }
          }

          const s_id = d_mouseout.source.id;
          const t_id = d_mouseout.target.id;
          d3.selectAll("circle.node")
            .filter((n) => n.id === s_id || n.id === t_id)
            .attr("fill", palette.node)
            .attr("stroke", palette.stroke)
            .attr("stroke-width", 2);

          // Restore status-colors and default stroke properties for all duplicate links
          d3.selectAll("path.duplicate-link")
            .attr("stroke", (d) => getLinkColorByCategory(d, palette))
            .attr("stroke-opacity", 1.0)
            .attr("stroke-width", 3);
        })
        .on("click", function (event, d_clicked_duplicate_link) {
          if (onLinkClick) {
            const payload = createLinkPopupPayload(d_clicked_duplicate_link);
            if (payload) onLinkClick(payload);
          }
          event.stopPropagation();
        });
    });
  });
}

// ===================================================================
// Node hover handlers to mark all links connected to the node
// ===================================================================
export function handleNodeMouseOver(d_node, linkSelection, palette, getMarkedLinkIds) {
  if (!d_node || !d_node.id) return;
  const nodeId = d_node.id;
  const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
  const hasMarked = markedIds && markedIds.size > 0;

  // If marked links are active, verify if this node connects to any marked link
  let hasConnectedMarkedLink = false;
  if (hasMarked) {
    if (linkSelection && linkSelection.size()) {
      linkSelection.each(function (l) {
        if (!l || !markedIds.has(l.id)) return;
        const sId =
          typeof l.source === "object" && l.source !== null
            ? l.source.id
            : l.source;
        const tId =
          typeof l.target === "object" && l.target !== null
            ? l.target.id
            : l.target;
        if (sId === nodeId || tId === nodeId) {
          hasConnectedMarkedLink = true;
        }
      });
    }
    const duplicateLinks = d3.selectAll("path.duplicate-link");
    if (!hasConnectedMarkedLink && !duplicateLinks.empty()) {
      duplicateLinks.each(function (l) {
        if (!l || !markedIds.has(l.id)) return;
        const sId =
          typeof l.source === "object" && l.source !== null
            ? l.source.id
            : l.source;
        const tId =
          typeof l.target === "object" && l.target !== null
            ? l.target.id
            : l.target;
        if (sId === nodeId || tId === nodeId) {
          hasConnectedMarkedLink = true;
        }
      });
    }

    if (!hasConnectedMarkedLink) {
      return; // Cannot hover on un-marked node when marked subset is active
    }
  }

  const connectedNodeIds = new Set([nodeId]);

  // 1. Highlight connected straight links (line.visible-link) and dim non-connected
  if (linkSelection && linkSelection.size()) {
    linkSelection.each(function (l) {
      if (!l) return;
      const sId =
        typeof l.source === "object" && l.source !== null
          ? l.source.id
          : l.source;
      const tId =
        typeof l.target === "object" && l.target !== null
          ? l.target.id
          : l.target;

      const isMarked = !hasMarked || markedIds.has(l.id);
      const isConnected = (sId === nodeId || tId === nodeId) && isMarked;

      if (isConnected) {
        if (sId === nodeId && typeof tId !== "undefined") connectedNodeIds.add(tId);
        if (tId === nodeId && typeof sId !== "undefined") connectedNodeIds.add(sId);

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
          .attr("stroke-opacity", hasMarked && isMarked ? 0.35 : 0.12)
          .attr("stroke-width", hasMarked && isMarked ? 3 : 1.5);
      }
    });
  }

  // 2. Highlight connected duplicate/parallel links if visible
  const duplicateLinks = d3.selectAll("path.duplicate-link");
  if (!duplicateLinks.empty()) {
    duplicateLinks.each(function (l) {
      if (!l) return;
      const sId =
        typeof l.source === "object" && l.source !== null
          ? l.source.id
          : l.source;
      const tId =
        typeof l.target === "object" && l.target !== null
          ? l.target.id
          : l.target;

      const isMarked = !hasMarked || markedIds.has(l.id);
      const isConnected = (sId === nodeId || tId === nodeId) && isMarked;

      if (isConnected) {
        if (sId === nodeId && typeof tId !== "undefined") connectedNodeIds.add(tId);
        if (tId === nodeId && typeof sId !== "undefined") connectedNodeIds.add(sId);

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
          .attr("stroke-opacity", hasMarked && isMarked ? 0.35 : 0.12)
          .attr("stroke-width", hasMarked && isMarked ? 3 : 2);
      }
    });
  }

  // 3. Highlight hovered node and connected neighbor nodes, dim others
  d3.selectAll("circle.node").each(function (n) {
    if (!n) return;
    if (n.id === nodeId) {
      d3.select(this)
        .raise()
        .attr("fill", palette.nodeHoverDirect)
        .attr("stroke", palette.nodeHoverLinkStroke || "#facc15")
        .attr("stroke-width", 4.5)
        .style("opacity", 1);
    } else if (connectedNodeIds.has(n.id)) {
      d3.select(this)
        .raise()
        .attr("fill", palette.nodeHoverLink)
        .attr("stroke", palette.nodeHoverLinkStroke || "#facc15")
        .attr("stroke-width", 3.5)
        .style("opacity", 1);
    } else {
      d3.select(this)
        .attr("fill", palette.node)
        .attr("stroke", palette.stroke)
        .attr("stroke-width", 2)
        .style("opacity", 0.25);
    }
  });

  // 4. Highlight labels for connected nodes, dim others
  d3.selectAll("text.label").each(function (n) {
    if (!n) return;
    const isConnected = connectedNodeIds.has(n.id);
    d3.select(this)
      .style("opacity", isConnected ? 1 : 0.25)
      .attr("font-weight", isConnected ? "bold" : "normal");
  });
}

export function handleNodeMouseOut(d_node, linkSelection, palette, getMarkedLinkIds) {
  const markedIds = getMarkedLinkIds ? getMarkedLinkIds() : null;
  if (markedIds && markedIds.size > 0) {
    const svgNode = linkSelection ? linkSelection.node() : null;
    const svg = svgNode ? d3.select(svgNode.ownerSVGElement || svgNode.closest("svg")) : null;
    if (svg && svg.node()) {
      applyMarkedState({ svg, markedLinkIds: markedIds, palette });
      return;
    }
  }

  // Restore all straight links
  if (linkSelection && linkSelection.size()) {
    linkSelection
      .attr("stroke", palette.link)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);
  }

  // Restore all duplicate/parallel links
  d3.selectAll("path.duplicate-link")
    .attr("stroke", (d) => getLinkColorByCategory(d, palette))
    .attr("stroke-opacity", 1.0)
    .attr("stroke-width", 3);

  // Restore all nodes
  d3.selectAll("circle.node")
    .attr("fill", palette.node)
    .attr("stroke", palette.stroke)
    .attr("stroke-width", 2)
    .style("opacity", 0.9);

  // Restore all labels
  d3.selectAll("text.label")
    .style("opacity", 1)
    .attr("font-weight", "normal");
}

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
  if (!zoomLayer || !zoomLayer.node()) {
    console.error(
      "zoomLayer was not provided or is invalid in setupInteractions."
    );
    return;
  }
  if (!linkHover || !linkHover.size()) {
    console.error(
      "`linkHover` selection (for .link-hover) is empty or invalid in setupInteractions. Hover will not work."
    );
    return;
  }

  const allNodes = node.data();

  // Attach hover interactions to nodes/circles
  if (node && node.size()) {
    node
      .on("mouseover.nodeLinksHover", function (event, d_node) {
        handleNodeMouseOver(d_node, link, palette, getMarkedLinkIds);
      })
      .on("mouseout.nodeLinksHover", function (event, d_node) {
        handleNodeMouseOut(d_node, link, palette, getMarkedLinkIds);
      });
  }

  linkHover
    .on("mouseover", function (event, d_hovered_linkhover) {
      handleMouseOver(
        d_hovered_linkhover,
        allNodes,
        filteredLinks,
        link,
        zoomLayer,
        tooltip,
        palette,
        onLinkClick,
        getMarkedLinkIds
      );
    })
    .on("mouseout", function (event, d_hovered_linkhover) {
      const relatedTarget = event.relatedTarget;
      let shouldProceedWithMouseOut = true;

      const currentOriginalSourceId =
        typeof d_hovered_linkhover.source === "object" &&
        d_hovered_linkhover.source !== null
          ? d_hovered_linkhover.source.id
          : d_hovered_linkhover.source;
      const currentOriginalTargetId =
        typeof d_hovered_linkhover.target === "object" &&
        d_hovered_linkhover.target !== null
          ? d_hovered_linkhover.target.id
          : d_hovered_linkhover.target;

      if (
        typeof currentOriginalSourceId === "undefined" ||
        typeof currentOriginalTargetId === "undefined"
      ) {
        // If IDs are missing, assume cleanup is needed
      } else {
        const currentOriginalKey = [
          currentOriginalSourceId,
          currentOriginalTargetId,
        ]
          .sort()
          .join("--");

        if (relatedTarget) {
          const rtSelection = d3.select(relatedTarget);
          const rtData = rtSelection.datum();

          if (
            rtSelection.classed("duplicate-link-hover") &&
            rtData &&
            typeof rtData.source !== "undefined" &&
            typeof rtData.target !== "undefined"
          ) {
            const relatedCurvedSourceId =
              typeof rtData.source === "object" && rtData.source !== null
                ? rtData.source.id
                : rtData.source;
            const relatedCurvedTargetId =
              typeof rtData.target === "object" && rtData.target !== null
                ? rtData.target.id
                : rtData.target;
            if (
              typeof relatedCurvedSourceId !== "undefined" &&
              typeof relatedCurvedTargetId !== "undefined"
            ) {
              const relatedCurvedKey = [
                relatedCurvedSourceId,
                relatedCurvedTargetId,
              ]
                .sort()
                .join("--");
              if (currentOriginalKey === relatedCurvedKey) {
                shouldProceedWithMouseOut = false;
              }
            }
          }
        }
      }

      if (shouldProceedWithMouseOut) {
        handleMouseOut(
          d_hovered_linkhover,
          link,
          tooltip,
          palette,
          getMarkedLinkIds
        );
      }
    })
    .on("click", function (event, d_clicked_linkhover) {
      if (onLinkClick) {
        const payload = createLinkPopupPayload(d_clicked_linkhover);
        if (payload) {
          onLinkClick(payload);
        }
      }
      console.log(
        "[Link Click] Straight link (.link-hover) ID:",
        d_clicked_linkhover.id
      ); // This is the original link ID
      event.stopPropagation();
    });
}
