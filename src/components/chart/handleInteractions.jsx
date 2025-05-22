import { linkPositionFromEdges } from "./drawHelpers";
import * as d3 from "d3";

export function groupLinksByPair(links) {
  const map = new Map();

  links.forEach((l) => {
    const source = typeof l.source === "object" ? l.source.id : l.source;
    const target = typeof l.target === "object" ? l.target.id : l.target;
    const key = [source, target].sort().join("--");

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key).push(l);
  });

  return map;
}

export function setupInteractions({ link, linkHover, filteredLinks, node }) {
  linkHover
    .on("mouseover", function () {
      const hoveredIndex = linkHover.nodes().indexOf(this);
      const hovered = filteredLinks[hoveredIndex];

      const sourceId =
        typeof hovered.source === "object" ? hovered.source.id : hovered.source;
      const targetId =
        typeof hovered.target === "object" ? hovered.target.id : hovered.target;
      const key = [sourceId, targetId].sort().join("--");

      // Hide the main straight line
      link.each(function (d) {
        const s = typeof d.source === "object" ? d.source.id : d.source;
        const t = typeof d.target === "object" ? d.target.id : d.target;
        const straightKey = [s, t].sort().join("--");
        if (straightKey === key) {
          d3.select(this)
            .attr("stroke-opacity", 0)
            .attr("pointer-events", "none");
        }
      });

      // Highlight nodes
      d3.selectAll("circle.node")
        .filter((n) => n.id === sourceId || n.id === targetId)
        .attr("fill", "#fde68a")
        .attr("stroke", "#facc15")
        .attr("stroke-width", 4);

      // Clear old paths
      const zoomLayer = d3.select(link.node().parentNode);
      zoomLayer.selectAll("path.duplicate-link").remove();
      zoomLayer.selectAll("path.duplicate-link-hover").remove();

      // Get duplicates
      const duplicates = filteredLinks.filter((l) => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        return [s, t].sort().join("--") === key;
      });

      // Get node edge points
      const allNodes = d3.selectAll("circle.node").data();
      const sourceNode = allNodes.find((n) => n.id === sourceId);
      const targetNode = allNodes.find((n) => n.id === targetId);
      const { x1, y1, x2, y2 } = linkPositionFromEdges(
        { source: sourceNode, target: targetNode },
        60
      );

      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);

      const ux = dx / length;
      const uy = dy / length;
      const perpX = -uy; // perpendicular vector
      const perpY = ux;

      duplicates.forEach((linkData, index) => {
        // now you can use linkData.id
        const offset = 10 * (index - (duplicates.length - 1) / 2);
        const startX = x1 + perpX * offset;
        const startY = y1 + perpY * offset;
        const endX = x2 + perpX * offset;
        const endY = y2 + perpY * offset;

        zoomLayer
          .append("path")
          .datum(linkData) // pass linkData to access `.id`
          .attr("class", "duplicate-link")
          .attr("d", `M${startX},${startY} L${endX},${endY}`)
          .attr("fill", "none")
          .attr("stroke", "#facc15")
          .attr("stroke-width", 3)
          .on("mousemove", function (event, d) {
            d3.select("#tooltip")
              .style("opacity", 1)
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY + 10}px`)
              .text(d.id); // ✅ Show link ID from datum
          });
      });
    })

    .on("mouseout", function () {
      const hoveredIndex = linkHover.nodes().indexOf(this);
      const hovered = filteredLinks[hoveredIndex];

      const sourceId =
        typeof hovered.source === "object" ? hovered.source.id : hovered.source;
      const targetId =
        typeof hovered.target === "object" ? hovered.target.id : hovered.target;
      const key = [sourceId, targetId].sort().join("--");

      // Restore the straight link
      link.each(function (d) {
        const s = typeof d.source === "object" ? d.source.id : d.source;
        const t = typeof d.target === "object" ? d.target.id : d.target;
        const straightKey = [s, t].sort().join("--");
        if (straightKey === key) {
          d3.select(this)
            .attr("stroke", "#94a3b8")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.6)
            .attr("pointer-events", "auto");
        }
      });

      // Restore node style
      d3.selectAll("circle.node")
        .attr("fill", "#29c6e0")
        .attr("stroke", "#60a5fa")
        .attr("stroke-width", 2);

      // Remove curved lines
      d3.select(link.node().parentNode)
        .selectAll("path.duplicate-link")
        .remove();

      // ✅ Hide tooltip
      d3.select("#tooltip").style("opacity", 0);
    });

  // Drag interaction
  node.call(
    d3
      .drag()
      .on("start", (event, d) => {
        if (!event.active) d3.select(this).dispatch("tick");
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        d.fx = null;
        d.fy = null;
      })
  );
}
