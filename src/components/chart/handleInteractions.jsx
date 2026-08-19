// src/chart/handleInteractions.js
import { linkPositionFromEdges } from "./drawHelpers";
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

  // Ensure 'id' for the popup system is the actual link's ID if available,
  // otherwise generate one. This 'id' is for the popup instance.
  // The original link's ID will be stored in a separate property if needed, e.g., 'originalLinkId'
  // For SiteDetailPopup, detailData.id is used for aria and keys.
  const popupId =
    linkDataObject.id ||
    `${sourceId}-${targetId}-${Math.random().toString(16).slice(2)}`;

  return {
    ...linkDataObject, // Spread existing link data to retain all original properties
    type: "link", // Explicitly set type for the popup
    id: popupId, // This ID is used by usePopupManager and SiteDetailPopup for its key and aria attributes

    // Fields expected by SiteDetailPopup for type: "link"
    // Adjust these based on the actual properties available in your linkDataObject
    // and what SiteDetailPopup expects.
    linkId: linkDataObject.id, // <<< Explicitly including the original link ID
    sourceNode: sourceId,
    targetNode: targetId,
    name:
      linkDataObject.name ||
      linkDataObject.id ||
      `Link ${sourceId}-${targetId}`, // A display name
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
// NEW: Helper function to get the correct color by category
// ===================================================================
function getLinkColorByCategory(linkData, palette) {
  if (!linkData) return palette?.link || "#6b7280";
  // Check category, status, or physical_status
  const category = (
    linkData.category ||
    linkData.status ||
    linkData.physical_status ||
    "issue"
  ).toLowerCase();
  // Return the color from the palette, or the issue color as a fallback
  return palette?.status?.[category] || palette?.status?.issue || "#f59e0b";
}

function handleMouseOut(d_hovered_orig, linkSelection, tooltip, palette) {
  if (
    !d_hovered_orig ||
    typeof d_hovered_orig.source === "undefined" ||
    typeof d_hovered_orig.target === "undefined"
  ) {
    linkSelection
      .attr("stroke", palette.link)
      .attr("stroke-opacity", 0.6)
      .style("pointer-events", "auto")
      .attr("stroke-width", 2);
    d3.selectAll("circle.node")
      .attr("fill", palette.node)
      .attr("stroke", palette.stroke)
      .attr("stroke-width", 2);
    d3.selectAll("path.duplicate-link").remove();
    d3.selectAll("path.duplicate-link-hover").remove();
    tooltip.attr("opacity", 0);
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
    linkSelection.attr("stroke-opacity", 0.6).style("pointer-events", "auto");
    d3.selectAll("circle.node")
      .attr("fill", palette.node)
      .attr("stroke", palette.stroke);
    d3.selectAll("path.duplicate-link").remove();
    d3.selectAll("path.duplicate-link-hover").remove();
    tooltip.attr("opacity", 0);
    return;
  }

  const key_unhovered = [sourceId, targetId].sort().join("--");

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

  d3.selectAll("circle.node")
    .filter((n) => n.id === sourceId || n.id === targetId)
    .attr("fill", palette.node)
    .attr("stroke", palette.stroke)
    .attr("stroke-width", 2);

  tooltip.attr("opacity", 0);

  d3.selectAll("path.duplicate-link").remove();
  d3.selectAll("path.duplicate-link-hover").remove();
}

function handleMouseOver(
  d_hovered_orig,
  allNodes,
  filteredLinks,
  linkSelection,
  zoomLayer,
  tooltip,
  palette,
  onLinkClick
) {
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
          tooltip
            .attr("x", event.offsetX + 10)
            .attr("y", event.offsetY - 10)
            .text(d_mousemove.id)
            .attr("opacity", 1);
        })
        // MODIFIED: Un-highlight nodes and restore link coloring on mouseout
        .on("mouseout", function (event, d_mouseout) {
          tooltip.attr("opacity", 0);
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
export function handleNodeMouseOver(d_node, linkSelection, palette) {
  if (!d_node || !d_node.id) return;
  const nodeId = d_node.id;

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

      const isConnected = sId === nodeId || tId === nodeId;
      if (isConnected) {
        if (sId === nodeId && typeof tId !== "undefined") connectedNodeIds.add(tId);
        if (tId === nodeId && typeof sId !== "undefined") connectedNodeIds.add(sId);

        d3.select(this)
          .raise()
          .attr("stroke", getLinkColorByCategory(l, palette))
          .attr("stroke-opacity", 1.0)
          .attr("stroke-width", 4.5);
      } else {
        d3.select(this)
          .attr("stroke", palette.link)
          .attr("stroke-opacity", 0.15)
          .attr("stroke-width", 1.5);
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

      const isConnected = sId === nodeId || tId === nodeId;
      if (isConnected) {
        if (sId === nodeId && typeof tId !== "undefined") connectedNodeIds.add(tId);
        if (tId === nodeId && typeof sId !== "undefined") connectedNodeIds.add(sId);

        d3.select(this)
          .raise()
          .attr("stroke", getLinkColorByCategory(l, palette))
          .attr("stroke-opacity", 1.0)
          .attr("stroke-width", 4.5);
      } else {
        d3.select(this)
          .attr("stroke", palette.link)
          .attr("stroke-opacity", 0.15)
          .attr("stroke-width", 2);
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
        .attr("stroke-width", 4)
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
        .style("opacity", 0.35);
    }
  });

  // 4. Highlight labels for connected nodes, dim others
  d3.selectAll("text.label").each(function (n) {
    if (!n) return;
    const isConnected = connectedNodeIds.has(n.id);
    d3.select(this)
      .style("opacity", isConnected ? 1 : 0.35)
      .attr("font-weight", isConnected ? "bold" : "normal");
  });
}

export function handleNodeMouseOut(d_node, linkSelection, palette) {
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
        handleNodeMouseOver(d_node, link, palette);
      })
      .on("mouseout.nodeLinksHover", function (event, d_node) {
        handleNodeMouseOut(d_node, link, palette);
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
        onLinkClick
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
        handleMouseOut(d_hovered_linkhover, link, tooltip, palette);
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
