// d3CoreSiteRenderer.js
import * as d3 from "d3";
import { linkPositionFromEdges } from "./drawHelpers";

const ANIMATION_DURATION = 750; // ms

export function drawCoreSiteChart(
  svgElement,
  {
    nodesData,
    linksData,
    focusedNodeId,
    centerX, // This is the X center of the canvas
    centerY, // This is the Y center for the VISUAL ZONE CIRCLE
    themeColors,
    onLinkClickCallback,
  }
) {
  const svg = d3.select(svgElement);
  const zoomLayer = svg.select("g.zoom-layer"); // Try to re-select if it exists

  if (zoomLayer.empty()) {
    // If zoomLayer doesn't exist, create it (first render)
    svg.selectAll("*").remove(); // Clear previous rendering if any (safer for first time)
    const newZoomLayer = svg.append("g").attr("class", "zoom-layer");

    // ----- Central Zone CIRCLE (visual representation) -----
    // This is drawn once and uses the passed centerY for its position
    newZoomLayer
      .append("circle")
      .attr("class", "zone-visualization-circle")
      .attr("cx", centerX) // centerX of the canvas
      .attr("cy", centerY) // centerY for the visual zone (e.g., height / 3)
      .attr("r", 150) // Fixed radius
      .attr("fill", themeColors.zoneCircleFill)
      .attr("fill-opacity", themeColors.zoneCircleOpacity);

    newZoomLayer.append("g").attr("class", "pulse-group");
    newZoomLayer.append("g").attr("class", "links-group");
    newZoomLayer.append("g").attr("class", "nodes-group");
    newZoomLayer.append("g").attr("class", "link-hover-group");
    newZoomLayer.append("g").attr("class", "node-labels-group");
  }

  // ----- Pulsing Circle for Selected Node -----
  const pulseGroup = svg.select("g.pulse-group");
  pulseGroup.selectAll("circle.node-pulse").remove(); // Clear previous pulse

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
        .attr("fill-opacity", 0) // Start transparent for entry
        .attr("stroke", themeColors.selectedNodePulseColor)
        .attr("stroke-width", 2)
        .lower(); // Draw below other elements in this group if any

      pulseCircle
        .transition()
        .duration(ANIMATION_DURATION / 2)
        .attr("fill-opacity", 0.7);

      // Simple re-pulsing logic if node remains selected
      function pulse() {
        if (
          pulseGroup.select("circle.node-pulse").empty() ||
          !nodesData.find((n) => n.id === focusedNodeId)
        )
          return; // Stop if removed or deselected
        pulseCircle
          .transition("pulse")
          .duration(1000)
          .attr("r", 60 + 10)
          .attr("fill-opacity", 0.3)
          .transition("pulse")
          .duration(1000)
          .attr("r", 60)
          .attr("fill-opacity", 0.7)
          .on("end.pulse", pulse);
      }
      pulse();
    }
  }

  // ----- Links -----
  const linksGroup = svg.select("g.links-group");
  const visibleLinks = linksGroup
    .selectAll("line.link")
    .data(linksData, (d) => d.id); // Use a key function for object constancy

  visibleLinks
    .exit()
    .transition()
    .duration(ANIMATION_DURATION / 2)
    .attr("stroke-opacity", 0)
    .remove();

  visibleLinks
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("x1", (d) => linkPositionFromEdges(d, 60).x1) // Initial position for entering links
    .attr("y1", (d) => linkPositionFromEdges(d, 60).y1)
    .attr("x2", (d) => linkPositionFromEdges(d, 60).x2)
    .attr("y2", (d) => linkPositionFromEdges(d, 60).y2)
    .attr("stroke", themeColors.linkStroke)
    .attr("stroke-opacity", 0) // Start transparent
    .merge(visibleLinks) // Merge enter and update selections
    .transition()
    .duration(ANIMATION_DURATION)
    .attr("x1", (d) => linkPositionFromEdges(d, 60).x1)
    .attr("y1", (d) => linkPositionFromEdges(d, 60).y1)
    .attr("x2", (d) => linkPositionFromEdges(d, 60).x2)
    .attr("y2", (d) => linkPositionFromEdges(d, 60).y2)
    .attr("stroke-opacity", themeColors.linkStrokeOpacity)
    .attr("stroke-width", 2);

  // ----- Nodes (Circles) -----
  const nodesGroup = svg.select("g.nodes-group");
  const nodeCircles = nodesGroup
    .selectAll("circle.node")
    .data(nodesData, (d) => d.id); // Key function

  nodeCircles
    .exit()
    .transition()
    .duration(ANIMATION_DURATION / 2)
    .attr("r", 0) // Shrink
    .style("opacity", 0)
    .remove();

  nodeCircles
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("cx", (d) => d.x) // Initial X for new nodes
    .attr("cy", (d) => d.y) // Initial Y for new nodes (could be off-screen if animating from far)
    .attr("r", 0) // Start small
    .style("opacity", 0)
    .merge(nodeCircles) // Merge enter and update
    .transition()
    .duration(ANIMATION_DURATION)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 60)
    .style("opacity", 1)
    .attr("fill", themeColors.nodeFill)
    .attr("stroke", (d) =>
      d.id === focusedNodeId
        ? themeColors.selectedNodePulseColor
        : themeColors.nodeStroke
    )
    .attr("stroke-width", (d) => (d.id === focusedNodeId ? 3 : 2));

  // ----- Link Hover Areas (Invisible) -----
  // These should also update if links change, but typically don't need smooth animation
  const linkHoverGroup = svg.select("g.link-hover-group");
  const linkHovers = linkHoverGroup
    .selectAll("line.link-hover")
    .data(linksData, (d) => d.id);

  linkHovers.exit().remove();

  linkHovers
    .enter()
    .append("line")
    .attr("class", "link-hover")
    .style("cursor", "pointer")
    .merge(linkHovers) // Update existing
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y)
    .attr("stroke", "transparent")
    .attr("stroke-width", 20)
    .on("mouseover", function (event, d_hovered_link) {
      // Re-select visibleLinks as it might have changed
      svg
        .selectAll("line.link")
        .filter((l) => l.id === d_hovered_link.id)
        .attr("stroke", themeColors.linkHoverStroke)
        .attr("stroke-width", 4);
      svg
        .selectAll("circle.node")
        .filter(
          (n) =>
            n.id === d_hovered_link.source.id ||
            n.id === d_hovered_link.target.id
        )
        .attr("fill", themeColors.nodeHoverFill)
        .attr("stroke", themeColors.nodeHoverStroke);
    })
    .on("mouseout", function (event, d_hovered_link) {
      svg
        .selectAll("line.link")
        .filter((l) => l.id === d_hovered_link.id)
        .attr("stroke", themeColors.linkStroke)
        .attr("stroke-opacity", themeColors.linkStrokeOpacity)
        .attr("stroke-width", 2);
      svg
        .selectAll("circle.node")
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
  const nodeLabelsGroup = svg.select("g.node-labels-group");
  const nodeLabels = nodeLabelsGroup
    .selectAll("text.node-label")
    .data(nodesData, (d) => d.id); // Key function

  nodeLabels
    .exit()
    .transition()
    .duration(ANIMATION_DURATION / 2)
    .style("opacity", 0)
    .remove();

  nodeLabels
    .enter()
    .append("text")
    .attr("class", "node-label")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .style("opacity", 0)
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .merge(nodeLabels) // Merge enter and update
    .transition()
    .duration(ANIMATION_DURATION)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .text((d) => d.id)
    .style("opacity", 1)
    .attr("fill", themeColors.nodeTextFill)
    .attr("font-size", (d) => (d.id === focusedNodeId ? "18px" : "14px"))
    .attr("font-weight", (d) => (d.id === focusedNodeId ? "bold" : "normal"));
}
