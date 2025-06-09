// components/CoreSiteCanvas.jsx
import React, { useEffect } from "react";
import * as d3 from "d3";
import { linkPositionFromEdges } from "./drawHelpers";

export default function CoreSiteCanvas({
  svgRef,
  node4Ref,
  nodes,
  links,
  centerX,
  centerY,
  width,
  height,
  currentZoneId, // Added to potentially use
  theme = "dark", // Added theme prop with a default
}) {
  useEffect(() => {
    if (!svgRef.current || width === 0 || height === 0) {
      return;
    }

    // Theme-dependent colors
    const T = {
      bgColor: theme === "dark" ? "#0f172a" : "#ffffff",
      zoneCircleFill: theme === "dark" ? "#38bdf8" : "#bae6fd", // Lighter blue for light mode
      zoneCircleOpacity: theme === "dark" ? 0.12 : 0.4,
      zoneLabelFill: theme === "dark" ? "#ffffff" : "#0c4a6e", // Darker blue/cyan for light mode text
      linkStroke: theme === "dark" ? "#94a3b8" : "#cbd5e1", // Lighter gray for light mode
      linkStrokeOpacity: 0.6,
      linkHoverStroke: "#f59e0b", // Amber for hover, good contrast on both
      nodeFill: theme === "dark" ? "#29c6e0" : "#67e8f9", // Lighter cyan for light mode
      nodeStroke: theme === "dark" ? "#60a5fa" : "#7dd3fc", // Lighter blue for light mode
      nodeTextFill: theme === "dark" ? "#ffffff" : "#155e75", // Darker cyan for text on light mode nodes
      nodeHoverFill: theme === "dark" ? "#fde68a" : "#fef08a", // Light yellow for hover
      nodeHoverStroke: "#f59e0b", // Amber for hover stroke
    };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", T.bgColor);

    svg.selectAll("*").remove();
    const zoomLayer = svg.append("g");

    // Zone circle and label
    zoomLayer
      .append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 150)
      .attr("fill", T.zoneCircleFill)
      .attr("fill-opacity", T.zoneCircleOpacity);

    zoomLayer
      .append("text")
      .attr("x", centerX)
      .attr("y", centerY - 200) // Adjust position as needed
      .text(currentZoneId ? `Zone ${currentZoneId}` : "Central Zone") // Use currentZoneId
      .attr("fill", T.zoneLabelFill)
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
      .attr("stroke", T.linkStroke)
      .attr("stroke-opacity", T.linkStrokeOpacity)
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
          .attr("stroke", T.linkHoverStroke)
          .attr("stroke-width", 4);

        svg
          .selectAll("circle.node")
          .filter((n) => n.id === d.source.id || n.id === d.target.id)
          .attr("fill", T.nodeHoverFill)
          .attr("stroke", T.nodeHoverStroke)
          .attr("stroke-width", 4);
      })
      .on("mouseout", function (event, d) {
        visibleLinks
          .filter((l) => l.id === d.id)
          .attr("stroke", T.linkStroke)
          .attr("stroke-opacity", T.linkStrokeOpacity)
          .attr("stroke-width", 2);

        svg
          .selectAll("circle.node")
          .attr("fill", T.nodeFill)
          .attr("stroke", T.nodeStroke)
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
      .attr("fill", T.nodeFill)
      .attr("stroke", T.nodeStroke)
      .attr("stroke-width", 2);

    // Node labels
    zoomLayer
      .append("g")
      .selectAll("text.node-label")
      .data(nodes)
      .join("text")
      .attr("class", "node-label")
      .text((d) => d.id)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("fill", T.nodeTextFill)
      .attr("font-size", "14px")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em");

    if (nodes && nodes.length > 0) {
      const foundNode = nodes.find((n) => n.id === "Node 4");
      node4Ref.current = foundNode || null;
      if (!foundNode) {
        console.warn("[CoreSiteCanvas] Node 4 not found in nodes data");
      }
    } else {
      node4Ref.current = null;
    }
  }, [
    svgRef,
    node4Ref,
    nodes,
    links,
    centerX,
    centerY,
    width,
    height,
    currentZoneId,
    theme,
  ]); // Added theme and currentZoneId to dependencies

  return null;
}
