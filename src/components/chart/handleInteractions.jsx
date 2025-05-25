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

function handleMouseOver(d, allNodes, filteredLinks, link, zoomLayer) {
  const sourceId = typeof d.source === "object" ? d.source.id : d.source;
  const targetId = typeof d.target === "object" ? d.target.id : d.target;
  const key = [sourceId, targetId].sort().join("--");

  // Hide the straight line
  link.each(function (l) {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    const straightKey = [s, t].sort().join("--");
    if (straightKey === key) {
      d3.select(this).attr("stroke-opacity", 0).attr("pointer-events", "none");
    }
  });

  // Highlight nodes
  d3.selectAll("circle.node")
    .filter((n) => n.id === sourceId || n.id === targetId)
    .attr("fill", "#fde68a")
    .attr("stroke", "#facc15")
    .attr("stroke-width", 4);

  // Remove old lines
  zoomLayer.selectAll("path.duplicate-link").remove();

  const duplicates = filteredLinks.filter((l) => {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    return [s, t].sort().join("--") === key;
  });

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
      .on("mousemove", function (event, d) {
        d3.select("#tooltip")
          .style("opacity", 1)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .text(d.id);
      })
      .on("mouseover", () =>
        handleMouseOver(linkData, allNodes, filteredLinks, link, zoomLayer)
      )
      .on("mouseout", () => handleMouseOut(linkData, link));

    // Add invisible hover path on top
    zoomLayer
      .append("path")
      .datum(linkData)
      .attr("class", "duplicate-link-hover")
      .attr("d", `M${startX},${startY} L${endX},${endY}`)
      .attr("fill", "none")
      .attr("stroke", "transparent")
      .attr("stroke-width", 12) // big invisible area
      .style("cursor", "pointer")
      .on("mouseover", () =>
        handleMouseOver(linkData, allNodes, filteredLinks, link, zoomLayer)
      )
      .on("mouseout", () => handleMouseOut(linkData, link));
  });
}

function handleMouseOut(d, link) {
  const sourceId = typeof d.source === "object" ? d.source.id : d.source;
  const targetId = typeof d.target === "object" ? d.target.id : d.target;
  const key = [sourceId, targetId].sort().join("--");

  link.each(function (l) {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    const straightKey = [s, t].sort().join("--");
    if (straightKey === key) {
      d3.select(this)
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.6)
        .attr("pointer-events", "auto");
    }
  });

  d3.selectAll("circle.node")
    .attr("fill", "#29c6e0")
    .attr("stroke", "#60a5fa")
    .attr("stroke-width", 2);

  d3.select("#tooltip").style("opacity", 0);
  d3.selectAll("path.duplicate-link").remove();
}

export function setupInteractions({ link, linkHover, filteredLinks }) {
  const allNodes = d3.selectAll("circle.node").data();
  const zoomLayer = d3.select(link.node().parentNode);

  linkHover
    .on("mouseover", function () {
      const hoveredIndex = linkHover.nodes().indexOf(this);
      const hovered = filteredLinks[hoveredIndex];
      handleMouseOver(hovered, allNodes, filteredLinks, link, zoomLayer);
    })
    .on("mouseout", function () {
      const hoveredIndex = linkHover.nodes().indexOf(this);
      const hovered = filteredLinks[hoveredIndex];
      handleMouseOut(hovered, link);
    });
}
