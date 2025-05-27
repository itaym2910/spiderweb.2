import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { NODES4, LINKS4 } from "./constants4";
import { linkPositionFromEdges, getNodeGroups } from "./drawHelpers";
import { renderCoreDevices } from "./renderCoreDevices";
import { setupInteractions } from "./handleInteractions";

const NetworkVisualizer4 = () => {
  const svgRef = useRef();

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const nodes = structuredClone(NODES4);
    const links = structuredClone(LINKS4);
    const NODE_GROUPS = getNodeGroups(nodes); // will pick up 4 zones

    // position nodes along tangents exactly as before
    const nodeMap = {};
    NODE_GROUPS.forEach((zone) => {
      const zoneNodes = nodes.filter((n) => n.zone === zone.id);
      const baseAngle = zone.angle;
      const perp = baseAngle + Math.PI / 2;
      const spacing = 140;
      zoneNodes.forEach((n, i) => {
        const offset = (i - (zoneNodes.length - 1) / 2) * spacing;
        n.x = zone.cx + offset * Math.cos(perp);
        n.y = zone.cy + offset * Math.sin(perp);
        nodeMap[n.id] = n;
      });
    });
    links.forEach((l) => {
      l.source = nodeMap[l.source];
      l.target = nodeMap[l.target];
    });

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();
    const tooltipLayer = svg.append("g"),
      zoomLayer = svg.append("g");

    svg.call(
      d3
        .zoom()
        .scaleExtent([0.5, 4])
        .on("zoom", ({ transform }) => zoomLayer.attr("transform", transform))
    );

    const { link, linkHover, node, label, filteredLinks } = renderCoreDevices(
      zoomLayer,
      nodes,
      links,
      NODE_GROUPS
    );

    const tooltip = tooltipLayer
      .append("text")
      .attr("class", "svg-tooltip")
      .attr("opacity", 0)
      .style("pointer-events", "none")
      .style("user-select", "none");

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    label.attr("x", (d) => d.x).attr("y", (d) => d.y);
    link
      .attr("x1", (d) => linkPositionFromEdges(d).x1)
      .attr("y1", (d) => linkPositionFromEdges(d).y1)
      .attr("x2", (d) => linkPositionFromEdges(d).x2)
      .attr("y2", (d) => linkPositionFromEdges(d).y2);
    linkHover
      .attr("x1", (d) => linkPositionFromEdges(d).x1)
      .attr("y1", (d) => linkPositionFromEdges(d).y1)
      .attr("x2", (d) => linkPositionFromEdges(d).x2)
      .attr("y2", (d) => linkPositionFromEdges(d).y2);

    requestAnimationFrame(() =>
      setupInteractions({ link, linkHover, filteredLinks, node, tooltip })
    );
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-800"
    />
  );
};

export default NetworkVisualizer4;
