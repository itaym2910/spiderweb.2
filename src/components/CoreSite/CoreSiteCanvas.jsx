// components/ZoneCanvas.jsx
import React, { useEffect } from "react";
import * as d3 from "d3";
import { linkPositionFromEdges } from "./drawHelpers";

export default function ZoneCanvas({
  svgRef,
  node4Ref,
  nodes,
  links,
  centerX,
  centerY,
}) {
  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)
      .style("background-color", "#0f172a");

    svg.selectAll("*").remove();
    const zoomLayer = svg.append("g");

    // Zone circle and label
    zoomLayer
      .append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 250)
      .attr("fill", "#38bdf8")
      .attr("fill-opacity", 0.12);

    zoomLayer
      .append("text")
      .attr("x", centerX)
      .attr("y", centerY - 270)
      .text("Zone A")
      .attr("fill", "#ffffff")
      .attr("font-size", "18px")
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold");

    // Links
    const visibleLinks = zoomLayer
      .append("g")
      .selectAll("line.link")
      .data(links)
      .join("line")
      .attr("class", "link")
      .attr("x1", (d) => linkPositionFromEdges(d).x1)
      .attr("y1", (d) => linkPositionFromEdges(d).y1)
      .attr("x2", (d) => linkPositionFromEdges(d).x2)
      .attr("y2", (d) => linkPositionFromEdges(d).y2)
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    zoomLayer
      .append("g")
      .selectAll("line.link-hover")
      .data(links)
      .join("line")
      .attr("class", "link-hover")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .attr("stroke", "transparent")
      .attr("stroke-width", 20)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        visibleLinks
          .filter((l) => l.id === d.id)
          .attr("stroke", "#facc15")
          .attr("stroke-width", 4);

        svg
          .selectAll("circle.node")
          .filter((n) => n.id === d.source.id || n.id === d.target.id)
          .attr("fill", "#fde68a")
          .attr("stroke", "#facc15")
          .attr("stroke-width", 4);
      })
      .on("mouseout", function (event, d) {
        visibleLinks
          .filter((l) => l.id === d.id)
          .attr("stroke", "#94a3b8")
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", 2);

        svg
          .selectAll("circle.node")
          .attr("fill", "#29c6e0")
          .attr("stroke", "#60a5fa")
          .attr("stroke-width", 2);
      });

    // Nodes
    zoomLayer
      .append("g")
      .selectAll("circle.node")
      .data(nodes)
      .join("circle")
      .attr("class", "node")
      .attr("r", 60)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("fill", "#29c6e0")
      .attr("stroke", "#60a5fa")
      .attr("stroke-width", 2);

    // Node labels
    zoomLayer
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d) => d.id)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("fill", "#ffffff")
      .attr("font-size", "14px")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em");

    node4Ref.current = nodes.find((n) => n.id === "Node 4");
  }, [svgRef, node4Ref, nodes, links, centerX, centerY]);

  return null;
}
