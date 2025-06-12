// src/chart/handleInteractions.js
import { linkPositionFromEdges } from "./drawHelpers";
import * as d3 from "d3";

// ... (groupLinksByPair function remains the same) ...

function handleMouseOver(
  d_hovered_orig,
  allNodes,
  filteredLinks,
  linkSelection,
  zoomLayer,
  tooltip
) {
  const sourceId =
    typeof d_hovered_orig.source === "object"
      ? d_hovered_orig.source.id
      : d_hovered_orig.source;
  const targetId =
    typeof d_hovered_orig.target === "object"
      ? d_hovered_orig.target.id
      : d_hovered_orig.target;
  const key = [sourceId, targetId].sort().join("--");
  // console.log(`[MouseOver] Link key: ${key}, ID: ${d_hovered_orig.id}`); // Optional debug

  linkSelection.each(function (l_straight) {
    const s =
      typeof l_straight.source === "object"
        ? l_straight.source.id
        : l_straight.source;
    const t =
      typeof l_straight.target === "object"
        ? l_straight.target.id
        : l_straight.target;
    const straightKey = [s, t].sort().join("--");
    if (straightKey === key) {
      // console.log(`[MouseOver] Hiding straight link: ${l_straight.id} (key: ${straightKey})`); // Optional debug
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
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    return [s, t].sort().join("--") === key;
  });

  const sourceNode = allNodes.find((n) => n.id === sourceId);
  const targetNode = allNodes.find((n) => n.id === targetId);

  if (!sourceNode || !targetNode) return;

  const { x1, y1, x2, y2 } = linkPositionFromEdges(
    { source: sourceNode, target: targetNode },
    60
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
      .attr("stroke", "#facc15")
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
          .text(d_mousemove.id)
          .attr("opacity", 1);
      })
      .on("mouseout", function () {
        tooltip.attr("opacity", 0);
      })
      .on("click", function (event, d_clicked_duplicate_link) {
        console.log(
          "[Link Click] Curved/Duplicate link ID:",
          d_clicked_duplicate_link.id
        );
        event.stopPropagation();
      });
  });
}

function handleMouseOut(
  d_hovered_orig, // Data of the link whose hover state is ending (from linkHover)
  linkSelection, // The D3 selection of visible straight gray links
  tooltip,
  palette
) {
  if (!d_hovered_orig || !d_hovered_orig.source || !d_hovered_orig.target) {
    console.error("[MouseOut] Invalid d_hovered_orig data", d_hovered_orig);
    // Attempt generic cleanup if data is bad, though less targeted
    linkSelection
      .attr("stroke", palette.link)
      .attr("stroke-opacity", 0.6)
      .style("pointer-events", "auto")
      .attr("stroke-width", 2);
    d3.selectAll("circle.node")
      .attr("fill", palette.node)
      .attr("stroke", palette.stroke)
      .attr("stroke-width", 2);
    return; // Exit if critical data is missing
  }

  const sourceId =
    typeof d_hovered_orig.source === "object"
      ? d_hovered_orig.source.id
      : d_hovered_orig.source;
  const targetId =
    typeof d_hovered_orig.target === "object"
      ? d_hovered_orig.target.id
      : d_hovered_orig.target;
  const key_unhovered = [sourceId, targetId].sort().join("--");

  console.log(
    `[MouseOut] Attempting to restore links for key_unhovered: '${key_unhovered}', from link ID: ${d_hovered_orig.id}`
  );

  linkSelection.each(function (l_straight) {
    // l_straight is data of a visible gray line
    if (!l_straight || !l_straight.source || !l_straight.target) {
      console.warn("[MouseOut] Invalid l_straight data in loop", l_straight);
      return; // Skip this iteration if data is malformed
    }
    const s_id =
      typeof l_straight.source === "object"
        ? l_straight.source.id
        : l_straight.source;
    const t_id =
      typeof l_straight.target === "object"
        ? l_straight.target.id
        : l_straight.target;
    const straightKey = [s_id, t_id].sort().join("--");

    // DEBUG: Log comparison for every straight link
    // console.log(`[MouseOut] Comparing: straightKey='${straightKey}' (id: ${l_straight.id}) vs key_unhovered='${key_unhovered}'`);

    if (straightKey === key_unhovered) {
      console.log(
        `[MouseOut] MATCH FOUND! Restoring straight link: ${l_straight.id} (key: ${straightKey})`
      );
      d3.select(this) // 'this' is the DOM element of the visible gray line
        .attr("stroke", palette.link)
        .attr("stroke-opacity", 0.6)
        .style("pointer-events", "auto")
        .attr("stroke-width", 2);
      // console.log(`[MouseOut] Opacity for ${l_straight.id} after restore:`, d3.select(this).attr("stroke-opacity")); // Verify attribute
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

export function setupInteractions({
  link,
  linkHover,
  filteredLinks,
  node,
  tooltip,
  palette,
  zoomLayer,
}) {
  if (!zoomLayer || !zoomLayer.node()) {
    console.error(
      "zoomLayer was not provided or is invalid in setupInteractions."
    );
    return;
  }
  const allNodes = node.data();

  linkHover
    .on("mouseover", function (event, d_hovered_linkhover) {
      handleMouseOver(
        d_hovered_linkhover,
        allNodes,
        filteredLinks,
        link, // This is linkSelection
        zoomLayer,
        tooltip
      );
    })
    .on("mouseout", function (event, d_hovered_linkhover) {
      const relatedTarget = event.relatedTarget;
      let shouldProceedWithMouseOut = true;

      if (
        relatedTarget &&
        d3.select(relatedTarget).classed("duplicate-link-hover")
      ) {
        const currentLinkSourceId =
          typeof d_hovered_linkhover.source === "object"
            ? d_hovered_linkhover.source.id
            : d_hovered_linkhover.source;
        const currentLinkTargetId =
          typeof d_hovered_linkhover.target === "object"
            ? d_hovered_linkhover.target.id
            : d_hovered_linkhover.target;
        const currentKey = [currentLinkSourceId, currentLinkTargetId]
          .sort()
          .join("--");

        const relatedData = d3.select(relatedTarget).datum();
        if (
          relatedData &&
          typeof relatedData.source !== "undefined" &&
          typeof relatedData.target !== "undefined"
        ) {
          const relatedSourceId =
            typeof relatedData.source === "object"
              ? relatedData.source.id
              : relatedData.source;
          const relatedTargetId =
            typeof relatedData.target === "object"
              ? relatedData.target.id
              : relatedData.target;
          const relatedKey = [relatedSourceId, relatedTargetId]
            .sort()
            .join("--");

          if (currentKey === relatedKey) {
            shouldProceedWithMouseOut = false;
          }
        }
      }

      if (shouldProceedWithMouseOut) {
        handleMouseOut(d_hovered_linkhover, link, tooltip, palette); // 'link' is linkSelection
      }
    })
    .on("click", function (event, d_clicked_linkhover) {
      console.log("[Link Click] Straight link ID:", d_clicked_linkhover.id);
      event.stopPropagation();
    });
}
