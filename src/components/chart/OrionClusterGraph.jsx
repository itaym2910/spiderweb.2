import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { NODES, LINKS } from "./constants";
import {
  constrainToZone,
  linkPositionFromEdges,
  CLUSTER_GROUPS,
} from "./drawHelpers";
import { createSimulation } from "./useSimulation";
import { renderClusters } from "./renderClusters";
import { setupInteractions } from "./handleInteractions";

const OrionClusterGraph = () => {
  const svgRef = useRef();

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const nodes = structuredClone(NODES);
    const links = structuredClone(LINKS);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#1f2937");

    svg.selectAll("*").remove();
    const zoomLayer = svg.append("g");

    svg.call(
      d3
        .zoom()
        .scaleExtent([0.5, 4])
        .on("zoom", (event) => {
          zoomLayer.attr("transform", event.transform);
        })
    );

    const { link, linkHover, node, label, filteredLinks } = renderClusters(
      zoomLayer,
      nodes,
      links,
      CLUSTER_GROUPS
    );

    setupInteractions({ link, linkHover, filteredLinks, node });

    createSimulation(nodes, links, () => {
      nodes.forEach((d) => constrainToZone(d, CLUSTER_GROUPS));

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
    });
  }, []);

  return (
    <div>
      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full" />
      <div
        id="tooltip"
        className="absolute px-2 py-1 bg-black text-white text-xs rounded pointer-events-none opacity-0 transition-opacity duration-200"
      ></div>
    </div>
  );
};

export default OrionClusterGraph;
