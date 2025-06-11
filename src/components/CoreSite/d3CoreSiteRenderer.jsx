// d3CoreSiteRenderer.js
import * as d3 from "d3";
import { linkPositionFromEdges } from "./drawHelpers"; // Assuming drawHelpers.js is in the same directory or adjust path

export function drawCoreSiteChart(
  svgElement,
  {
    nodesData,
    linksData,
    focusedNodeId,

    centerX,
    centerY,
    // currentZoneId, // No longer used for direct rendering here
    themeColors,
    onLinkClickCallback,
  }
) {
  const svg = d3.select(svgElement);

  svg.selectAll("*").remove(); // Clear previous rendering

  const zoomLayer = svg.append("g");

  // ----- Central Zone CIRCLE (visual representation) -----
  zoomLayer
    .append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", 150)
    .attr("fill", themeColors.zoneCircleFill)
    .attr("fill-opacity", themeColors.zoneCircleOpacity);

  // ----- Pulsing Circle for Selected Node -----
  const pulseGroup = zoomLayer.append("g").attr("class", "pulse-group");
  if (focusedNodeId) {
    const selectedNodeData = nodesData.find((n) => n.id === focusedNodeId);
    if (selectedNodeData) {
      const pulseCircle = pulseGroup
        .append("circle")
        .attr("class", "node-pulse")
        .attr("cx", selectedNodeData.x)
        .attr("cy", selectedNodeData.y)
        .attr("r", 60)
        .attr("fill", themeColors.selectedNodePulseColor)
        .attr("fill-opacity", 0.7)
        .attr("stroke", themeColors.selectedNodePulseColor)
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

  // ----- Links -----
  const visibleLinks = zoomLayer
    .append("g")
    .attr("class", "links-group")
    .selectAll("line.link")
    .data(linksData)
    .join("line")
    .attr("class", "link")
    .attr("x1", (d) => linkPositionFromEdges(d).x1)
    .attr("y1", (d) => linkPositionFromEdges(d).y1)
    .attr("x2", (d) => linkPositionFromEdges(d).x2)
    .attr("y2", (d) => linkPositionFromEdges(d).y2)
    .attr("stroke", themeColors.linkStroke)
    .attr("stroke-opacity", themeColors.linkStrokeOpacity)
    .attr("stroke-width", 2);

  // ----- Nodes (Circles) -----
  const nodeCircles = zoomLayer
    .append("g")
    .attr("class", "nodes-group")
    .selectAll("circle.node")
    .data(nodesData)
    .join("circle")
    .attr("class", "node")
    .attr("r", 60)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("fill", themeColors.nodeFill)
    .attr("stroke", (d) =>
      d.id === focusedNodeId
        ? themeColors.selectedNodePulseColor
        : themeColors.nodeStroke
    )
    .attr("stroke-width", (d) => (d.id === focusedNodeId ? 3 : 2));

  // ----- Link Hover Areas (Invisible) -----
  zoomLayer
    .append("g")
    .attr("class", "link-hover-group")
    .selectAll("line.link-hover")
    .data(linksData)
    .join("line")
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
        .attr("stroke", themeColors.linkHoverStroke)
        .attr("stroke-width", 4);

      nodeCircles
        .filter(
          (n) =>
            n.id === d_hovered_link.source.id ||
            n.id === d_hovered_link.target.id
        )
        .attr("fill", themeColors.nodeHoverFill)
        .attr("stroke", themeColors.nodeHoverStroke)
        .attr("stroke-width", 4);
    })
    .on("mouseout", function (event, d_hovered_link) {
      visibleLinks
        .filter((l) => l.id === d_hovered_link.id)
        .attr("stroke", themeColors.linkStroke)
        .attr("stroke-opacity", themeColors.linkStrokeOpacity)
        .attr("stroke-width", 2);

      nodeCircles
        .attr("fill", themeColors.nodeFill)
        .attr("stroke", (n) =>
          n.id === focusedNodeId
            ? themeColors.selectedNodePulseColor
            : themeColors.nodeStroke
        )
        .attr("stroke-width", (n) => (n.id === focusedNodeId ? 3 : 2));
    })
    .on("click", function (event, d_clicked_link) {
      if (onLinkClickCallback) {
        onLinkClickCallback(d_clicked_link);
      }
    });

  // ----- Node Labels (Text) -----
  zoomLayer
    .append("g")
    .attr("class", "node-labels-group")
    .selectAll("text.node-label")
    .data(nodesData)
    .join("text")
    .attr("class", "node-label")
    .text((d) => d.id)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .attr("fill", themeColors.nodeTextFill)
    .attr("font-size", (d) => (d.id === focusedNodeId ? "18px" : "14px"))
    .attr("font-weight", (d) => (d.id === focusedNodeId ? "bold" : "normal"))
    .attr("text-anchor", "middle")
    .attr("dy", ".35em");
}
