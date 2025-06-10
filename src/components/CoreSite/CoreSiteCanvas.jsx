// components/CoreSiteCanvas.jsx
import React, { useEffect } from "react";
import * as d3 from "d3";
import { linkPositionFromEdges } from "./drawHelpers";

export default function CoreSiteCanvas({
  svgRef,
  focusedNodeDataRef, // Renamed from node4Ref, this is the ref object to populate
  focusedNodeId, // ID of the node to find and assign to focusedNodeDataRef.current
  nodes,
  links,
  centerX,
  centerY,
  width,
  height,
  currentZoneId,
  theme = "dark",
  onLinkClick,
}) {
  useEffect(() => {
    if (!svgRef.current || width === 0 || height === 0) {
      return;
    }

    const T = {
      bgColor: theme === "dark" ? "#1f2937" : "#ffffff",
      zoneCircleFill: theme === "dark" ? "#38bdf8" : "#bae6fd",
      zoneCircleOpacity: theme === "dark" ? 0.12 : 0.4,
      zoneLabelFill: theme === "dark" ? "#ffffff" : "#0c4a6e",
      linkStroke: theme === "dark" ? "#94a3b8" : "#cbd5e1",
      linkStrokeOpacity: 0.6,
      linkHoverStroke: "#f59e0b",
      nodeFill: theme === "dark" ? "#29c6e0" : "#67e8f9",
      nodeStroke: theme === "dark" ? "#60a5fa" : "#7dd3fc",
      nodeTextFill: theme === "dark" ? "#ffffff" : "#155e75",
      nodeHoverFill: theme === "dark" ? "#fde68a" : "#fef08a",
      nodeHoverStroke: "#f59e0b",
    };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", T.bgColor);

    svg.selectAll("*").remove();
    const zoomLayer = svg.append("g");

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
      .attr("y", centerY - 200)
      .text(currentZoneId ? `Zone ${currentZoneId}` : "Central Zone")
      .attr("fill", T.zoneLabelFill)
      .attr("font-size", "18px")
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold");

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
      })
      .on("click", function (event, d_clicked_link) {
        if (onLinkClick) {
          onLinkClick(d_clicked_link);
        }
      });

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

    // Find the focused node and update the ref
    if (focusedNodeDataRef && nodes && nodes.length > 0 && focusedNodeId) {
      const foundNode = nodes.find((n) => n.id === focusedNodeId);
      focusedNodeDataRef.current = foundNode || null;
      if (!foundNode) {
        console.warn(
          `[CoreSiteCanvas] Node ${focusedNodeId} not found in nodes data`
        );
      }
    } else if (focusedNodeDataRef) {
      focusedNodeDataRef.current = null;
    }
  }, [
    svgRef,
    focusedNodeDataRef, // Add to dependencies
    focusedNodeId, // Add to dependencies
    nodes,
    links,
    centerX,
    centerY,
    width,
    height,
    currentZoneId,
    theme,
    onLinkClick,
  ]);

  return null;
}
