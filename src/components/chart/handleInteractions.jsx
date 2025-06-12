// src/chart/handleInteractions.js
import { linkPositionFromEdges } from "./drawHelpers";
import * as d3 from "d3";

function handleMouseOut(d_hovered_orig, linkSelection, tooltip, palette) {
  if (
    !d_hovered_orig ||
    typeof d_hovered_orig.source === "undefined" ||
    typeof d_hovered_orig.target === "undefined"
  ) {
    // Attempt generic cleanup if data is bad
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
  palette
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
        console.log(
          // Retained as requested
          "[Link Click] Curved/Duplicate link ID:",
          d_clicked_duplicate_link.id
        );
        event.stopPropagation();
      });
  });
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
    ); // Retain error log
    return;
  }
  if (!linkHover || !linkHover.size()) {
    console.error(
      "`linkHover` selection (for .link-hover) is empty or invalid in setupInteractions. Hover will not work."
    ); // Retain error log
    return;
  }

  const allNodes = node.data();

  linkHover
    .on("mouseover", function (event, d_hovered_linkhover) {
      handleMouseOver(
        d_hovered_linkhover,
        allNodes,
        filteredLinks,
        link,
        zoomLayer,
        tooltip,
        palette
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
      console.log(
        "[Link Click] Straight link (.link-hover) ID:",
        d_clicked_linkhover.id
      ); // Retained as requested
      event.stopPropagation();
    });
}
