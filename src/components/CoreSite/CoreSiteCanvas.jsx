// components/CoreSiteCanvas.jsx
import React, { useEffect } from "react";
import * as d3 from "d3";
import { linkPositionFromEdges } from "./drawHelpers";

export default function CoreSiteCanvas({
  svgRef,
  focusedNodeDataRef,
  focusedNodeId,
  nodes,
  links,
  centerX,
  centerY,
  width,
  height,
  currentZoneId, // Still needed for logic if any, but not for direct rendering here
  theme = "dark",
  onLinkClick,
}) {
  useEffect(() => {
    if (!svgRef.current || width === 0 || height === 0) {
      return;
    }

    const T = {
      bgColor: theme === "dark" ? "#1f2937" : "#ffffff",
      zoneCircleFill: theme === "dark" ? "#38bdf8" : "#bae6fd", // color for the D3 circle
      zoneCircleOpacity: theme === "dark" ? 0.12 : 0.4,
      // zoneLabelFill: theme === "dark" ? "#ffffff" : "#0c4a6e", // No longer needed here
      linkStroke: theme === "dark" ? "#94a3b8" : "#cbd5e1",
      linkStrokeOpacity: 0.6,
      linkHoverStroke: "#f59e0b",
      nodeFill: theme === "dark" ? "#29c6e0" : "#67e8f9",
      nodeStroke: theme === "dark" ? "#60a5fa" : "#7dd3fc",
      nodeTextFill: theme === "dark" ? "#ffffff" : "#155e75",
      nodeHoverFill: theme === "dark" ? "#fde68a" : "#fef08a",
      nodeHoverStroke: "#f59e0b",
      selectedNodePulseColor: theme === "dark" ? "#2563eb" : "#3b82f6",
    };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", T.bgColor);

    svg.selectAll("*").remove();

    const zoomLayer = svg.append("g");

    // ----- Central Zone CIRCLE (visual representation) -----
    // The text label will now be HTML
    zoomLayer
      .append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 150) // This radius might need adjustment if it was visually tied to the text position
      .attr("fill", T.zoneCircleFill)
      .attr("fill-opacity", T.zoneCircleOpacity);

    // REMOVE OR COMMENT OUT D3 ZONE TEXT RENDERING
    /*
    zoomLayer
      .append("text")
      .attr("x", centerX)
      .attr("y", centerY - 200) // Original position
      .text(currentZoneId ? `Zone ${currentZoneId}` : "Central Zone")
      .attr("fill", T.zoneLabelFill)
      .attr("font-size", "18px")
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold");
    */

    // ... (rest of the D3 code for links, nodes, pulse, etc.)
    const pulseGroup = zoomLayer.append("g").attr("class", "pulse-group");

    if (focusedNodeId) {
      const selectedNodeData = nodes.find((n) => n.id === focusedNodeId);
      if (selectedNodeData) {
        const pulseCircle = pulseGroup
          .append("circle")
          .attr("class", "node-pulse")
          .attr("cx", selectedNodeData.x)
          .attr("cy", selectedNodeData.y)
          .attr("r", 60)
          .attr("fill", T.selectedNodePulseColor)
          .attr("fill-opacity", 0.7)
          .attr("stroke", T.selectedNodePulseColor)
          .attr("stroke-width", 2)
          .lower();

        function pulse() {
          pulseCircle
            .transition()
            .duration(1000)
            .attr("r", 60 + 10)
            .attr("fill-opacity", 0.3)
            .transition()
            .duration(1000)
            .attr("r", 60)
            .attr("fill-opacity", 0.7)
            .on("end", pulse);
        }
        pulse();
      }
    }

    const visibleLinks = zoomLayer
      .append("g")
      .attr("class", "links-group")
      .selectAll("line.link")
      .data(links)
      .join("line")
      // ... link attributes
      .attr("class", "link")
      .attr("x1", (d) => linkPositionFromEdges(d).x1)
      .attr("y1", (d) => linkPositionFromEdges(d).y1)
      .attr("x2", (d) => linkPositionFromEdges(d).x2)
      .attr("y2", (d) => linkPositionFromEdges(d).y2)
      .attr("stroke", T.linkStroke)
      .attr("stroke-opacity", T.linkStrokeOpacity)
      .attr("stroke-width", 2);

    const nodeCircles = zoomLayer
      .append("g")
      .attr("class", "nodes-group")
      .selectAll("circle.node")
      .data(nodes)
      .join("circle")
      // ... node attributes
      .attr("class", "node")
      .attr("r", 60)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("fill", T.nodeFill)
      .attr("stroke", (d) =>
        d.id === focusedNodeId ? T.selectedNodePulseColor : T.nodeStroke
      )
      .attr("stroke-width", (d) => (d.id === focusedNodeId ? 3 : 2));

    zoomLayer
      .append("g")
      .attr("class", "link-hover-group")
      .selectAll("line.link-hover")
      .data(links)
      .join("line")
      // ... link hover attributes and event handlers
      .attr("class", "link-hover")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .attr("stroke", "transparent")
      .attr("stroke-width", 20)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d_hovered_link) {
        visibleLinks
          .filter((l) => l.id === d_hovered_link.id)
          .attr("stroke", T.linkHoverStroke)
          .attr("stroke-width", 4);

        nodeCircles
          .filter(
            (n) =>
              n.id === d_hovered_link.source.id ||
              n.id === d_hovered_link.target.id
          )
          .attr("fill", T.nodeHoverFill)
          .attr("stroke", T.nodeHoverStroke)
          .attr("stroke-width", 4);
      })
      .on("mouseout", function (event, d_hovered_link) {
        visibleLinks
          .filter((l) => l.id === d_hovered_link.id)
          .attr("stroke", T.linkStroke)
          .attr("stroke-opacity", T.linkStrokeOpacity)
          .attr("stroke-width", 2);

        nodeCircles
          .attr("fill", T.nodeFill)
          .attr("stroke", (n) =>
            n.id === focusedNodeId ? T.selectedNodePulseColor : T.nodeStroke
          )
          .attr("stroke-width", (n) => (n.id === focusedNodeId ? 3 : 2));
      })
      .on("click", function (event, d_clicked_link) {
        if (onLinkClick) {
          onLinkClick(d_clicked_link);
        }
      });

    zoomLayer
      .append("g")
      .attr("class", "node-labels-group")
      .selectAll("text.node-label")
      .data(nodes)
      .join("text")
      // ... node label attributes
      .attr("class", "node-label")
      .text((d) => d.id)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("fill", T.nodeTextFill)
      .attr("font-size", (d) => (d.id === focusedNodeId ? "18px" : "14px"))
      .attr("font-weight", (d) => (d.id === focusedNodeId ? "bold" : "normal"))
      .attr("text-anchor", "middle")
      .attr("dy", ".35em");

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
    focusedNodeDataRef,
    focusedNodeId,
    nodes,
    links,
    centerX,
    centerY,
    width,
    height,
    currentZoneId, // Keep if other logic depends on it, even if not rendered here
    theme,
    onLinkClick,
  ]);

  return null;
}
