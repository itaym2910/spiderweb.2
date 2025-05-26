import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { NODES, LINKS } from "./constants";
import { linkPositionFromEdges, getClusterGroups } from "./drawHelpers";
import { renderCoreDevices } from "./renderCoreDevices";
import { setupInteractions } from "./handleInteractions";

const NetworkVisualizer = () => {
  const svgRef = useRef();

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const nodes = structuredClone(NODES);
    const links = structuredClone(LINKS);
    const CLUSTER_GROUPS = getClusterGroups(nodes);

    const nodeMap = {};
    CLUSTER_GROUPS.forEach((zone) => {
      const zoneNodes = nodes.filter((n) => n.zone === zone.id);

      // Vector from zone to center

      const baseAngle = zone.angle;
      const perpendicularAngle = baseAngle + Math.PI / 2; // tangent to the circle

      const spacing = 140; // distance between nodes in same zone
      const radiusFromZone = 0; // if you want to push them further out radially, increase this

      zoneNodes.forEach((node, i) => {
        const offset = (i - (zoneNodes.length - 1) / 2) * spacing;

        node.x =
          zone.cx +
          offset * Math.cos(perpendicularAngle) +
          radiusFromZone * Math.cos(baseAngle);
        node.y =
          zone.cy +
          offset * Math.sin(perpendicularAngle) +
          radiusFromZone * Math.sin(baseAngle);

        nodeMap[node.id] = node;
      });
    });

    // Replace source/target strings with actual node objects (needed for .x/.y)
    links.forEach((link) => {
      link.source = nodeMap[link.source];
      link.target = nodeMap[link.target];
    });

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#1f2937");

    svg.selectAll("*").remove();
    const tooltipLayer = svg.append("g");
    const zoomLayer = svg.append("g");

    svg.call(
      d3
        .zoom()
        .scaleExtent([0.5, 4])
        .on("zoom", (event) => {
          zoomLayer.attr("transform", event.transform);
        })
    );

    const { link, linkHover, node, label, filteredLinks } = renderCoreDevices(
      zoomLayer,
      nodes,
      links,
      CLUSTER_GROUPS
    );

    const tooltip = tooltipLayer
      .append("text")
      .attr("class", "svg-tooltip")
      .attr("x", 0) // default initial position — important!
      .attr("y", 0)
      .attr("text-anchor", "start")
      .attr("font-size", 14) // make it temporarily larger for debug
      .attr("fill", "white")
      .attr("opacity", 0)
      .style("pointer-events", "none")
      .style("user-select", "none");

    // Apply positions manually
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

    requestAnimationFrame(() => {
      setupInteractions({ link, linkHover, filteredLinks, node, tooltip });
    });

    console.log("Setup complete");
    console.log("Nodes:", d3.selectAll("circle.node").size());
    console.log("Hover lines:", d3.selectAll(".link-hover").size());
  }, []);

  return (
    <div>
      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
};

export default NetworkVisualizer;
