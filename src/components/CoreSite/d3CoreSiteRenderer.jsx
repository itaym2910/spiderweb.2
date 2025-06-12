// d3CoreSiteRenderer.js
import * as d3 from "d3";
import { linkPositionFromEdges } from "./drawHelpers";

const ANIMATION_DURATION = 750; // ms
const PULSE_ANIMATION_NAME = "pulseEffect"; // For specifically stopping this animation

export function drawCoreSiteChart(
  svgElement,
  {
    nodesData,
    linksData,
    focusedNodeId, // The ID of the single node to pulse
    centerX,
    centerY, // Y center for the VISUAL ZONE CIRCLE
    themeColors,
    onLinkClickCallback,
  }
) {
  const svg = d3.select(svgElement);
  let zoomLayer = svg.select("g.zoom-layer");

  if (zoomLayer.empty()) {
    svg.selectAll("*").remove();
    zoomLayer = svg.append("g").attr("class", "zoom-layer");

    zoomLayer
      .append("circle")
      .attr("class", "zone-visualization-circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 150)
      .attr("fill", themeColors.zoneCircleFill)
      .attr("fill-opacity", themeColors.zoneCircleOpacity);

    // Create groups for drawing order
    zoomLayer.append("g").attr("class", "links-group");
    zoomLayer.append("g").attr("class", "pulse-group"); // Pulse group BEFORE nodes
    zoomLayer.append("g").attr("class", "nodes-group");
    zoomLayer.append("g").attr("class", "link-hover-group");
    zoomLayer.append("g").attr("class", "node-labels-group");
  }

  const pulseGroup = zoomLayer.select("g.pulse-group");
  const linksGroup = zoomLayer.select("g.links-group");
  const nodesGroup = zoomLayer.select("g.nodes-group");
  const linkHoverGroup = zoomLayer.select("g.link-hover-group");
  const nodeLabelsGroup = zoomLayer.select("g.node-labels-group");

  // --- Pulsing Circle for Selected Node ---
  // Data for the pulse: an array containing the single selected node, or empty if none.
  const selectedNodeDataArray = focusedNodeId
    ? nodesData.filter((n) => n.id === focusedNodeId)
    : [];

  const pulseCircles = pulseGroup
    .selectAll("circle.node-pulse")
    .data(selectedNodeDataArray, (d) => d.id); // Keyed by node ID

  // EXIT: Remove pulse if node is deselected or disappears
  pulseCircles
    .exit()
    .interrupt(PULSE_ANIMATION_NAME) // Stop any ongoing pulse animation
    .transition("pulseExit")
    .duration(ANIMATION_DURATION / 2)
    .attr("r", 0)
    .style("opacity", 0)
    .remove();

  // ENTER: Create new pulse if a node becomes selected
  const pulseEnter = pulseCircles
    .enter()
    .append("circle")
    .attr("class", "node-pulse")
    .attr("r", 0) // Start small for entry animation
    .style("opacity", 0) // Start transparent
    .attr("fill", themeColors.selectedNodePulseColor)
    .attr("stroke", themeColors.selectedNodePulseColor)
    .attr("stroke-width", 2);
  // .lower(); // Ensure it's behind the actual node visual if nodes are in a different group

  // UPDATE + ENTER: Animate pulse to position and start/restart pulsing effect
  pulseEnter
    .merge(pulseCircles) // Apply to both new and existing pulse circles (though there should only be one)
    .interrupt(PULSE_ANIMATION_NAME) // Stop previous pulse animation before starting new
    .attr("cx", (d) => d.x) // Set initial CX for entering, update for existing (though it shouldn't change if keyed)
    .attr("cy", (d) => d.y) // Set initial CY for entering
    .transition("pulseMoveAppear")
    .duration(ANIMATION_DURATION)
    .attr("cx", (d) => d.x) // Animate to final X
    .attr("cy", (d) => d.y) // Animate to final Y
    .attr("r", 60)
    .style("opacity", 0.7)
    .on("end.startPulseEffect", function (d) {
      // 'd' is the selectedNodeData
      // Start the continuous pulse animation (radius and opacity oscillation)
      const circle = d3.select(this);

      function continuousPulse() {
        // Check if this circle still exists and if the node is STILL the focusedNodeId
        if (circle.empty() || focusedNodeId !== d.id) {
          // console.log("Stopping pulse for:", d.id, "Current focused:", focusedNodeId);
          circle.interrupt(PULSE_ANIMATION_NAME); // Stop named transition
          return;
        }
        // console.log("Pulsing for:", d.id);
        circle
          .transition(PULSE_ANIMATION_NAME) // Named transition
          .duration(1000)
          .attr("r", 60 + 10)
          .style("opacity", 0.3)
          .transition(PULSE_ANIMATION_NAME) // Chain with the same name
          .duration(1000)
          .attr("r", 60)
          .style("opacity", 0.7)
          .on("end.continuousPulse", continuousPulse); // Loop
      }
      continuousPulse(); // Initiate
    });

  // ----- Links -----
  const visibleLinks = linksGroup
    .selectAll("line.link")
    .data(linksData, (d) => d.id);

  visibleLinks
    .exit()
    .transition("linkExit")
    .duration(ANIMATION_DURATION / 2)
    .style("opacity", 0)
    .remove();

  visibleLinks
    .enter()
    .append("line")
    .attr("class", "link")
    // Set initial positions based on potentially OLD node positions if nodes are also moving
    .attr("x1", (d) =>
      d.source && nodesData.find((n) => n.id === d.source.id)
        ? linkPositionFromEdges(d, 60).x1
        : 0
    )
    .attr("y1", (d) =>
      d.source && nodesData.find((n) => n.id === d.source.id)
        ? linkPositionFromEdges(d, 60).y1
        : 0
    )
    .attr("x2", (d) =>
      d.target && nodesData.find((n) => n.id === d.target.id)
        ? linkPositionFromEdges(d, 60).x2
        : 0
    )
    .attr("y2", (d) =>
      d.target && nodesData.find((n) => n.id === d.target.id)
        ? linkPositionFromEdges(d, 60).y2
        : 0
    )
    .attr("stroke", themeColors.linkStroke)
    .style("opacity", 0)
    .merge(visibleLinks)
    .transition("linkUpdate")
    .duration(ANIMATION_DURATION)
    .attr("x1", (d) => linkPositionFromEdges(d, 60).x1)
    .attr("y1", (d) => linkPositionFromEdges(d, 60).y1)
    .attr("x2", (d) => linkPositionFromEdges(d, 60).x2)
    .attr("y2", (d) => linkPositionFromEdges(d, 60).y2)
    .style("opacity", themeColors.linkStrokeOpacity)
    .attr("stroke-width", 2);

  // ----- Nodes (Circles) -----
  const nodeCircles = nodesGroup
    .selectAll("circle.node")
    .data(nodesData, (d) => d.id);

  nodeCircles
    .exit()
    .transition("nodeExit")
    .duration(ANIMATION_DURATION / 2)
    .attr("r", 0)
    .style("opacity", 0)
    .remove();

  nodeCircles
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 0)
    .style("opacity", 0)
    .merge(nodeCircles)
    .transition("nodeUpdate")
    .duration(ANIMATION_DURATION)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 60)
    .style("opacity", 1)
    .attr("fill", themeColors.nodeFill)
    .attr("stroke", (d) =>
      d.id === focusedNodeId
        ? themeColors.selectedNodePulseColor // Keep selected node distinct
        : themeColors.nodeStroke
    )
    .attr("stroke-width", (d) => (d.id === focusedNodeId ? 3 : 2));

  // ----- Link Hover Areas -----
  const linkHovers = linkHoverGroup
    .selectAll("line.link-hover")
    .data(linksData, (d) => d.id);

  linkHovers.exit().remove();

  linkHovers
    .enter()
    .append("line")
    .attr("class", "link-hover")
    .style("cursor", "pointer")
    .merge(linkHovers)
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y)
    .attr("stroke", "transparent")
    .attr("stroke-width", 20)
    .on("mouseover", function (event, d_hovered_link) {
      linksGroup
        .selectAll("line.link") // Re-select from the group
        .filter((l) => l.id === d_hovered_link.id)
        .attr("stroke", themeColors.linkHoverStroke)
        .attr("stroke-width", 4);
      nodesGroup
        .selectAll("circle.node") // Re-select from the group
        .filter(
          (n) =>
            n.id === d_hovered_link.source.id ||
            n.id === d_hovered_link.target.id
        )
        .attr("fill", themeColors.nodeHoverFill)
        .attr("stroke", themeColors.nodeHoverStroke);
    })
    .on("mouseout", function (event, d_hovered_link) {
      linksGroup
        .selectAll("line.link")
        .filter((l) => l.id === d_hovered_link.id)
        .attr("stroke", themeColors.linkStroke)
        .style("opacity", themeColors.linkStrokeOpacity)
        .attr("stroke-width", 2);
      nodesGroup
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
  const nodeLabels = nodeLabelsGroup
    .selectAll("text.node-label")
    .data(nodesData, (d) => d.id);

  nodeLabels
    .exit()
    .transition("labelExit")
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
    .merge(nodeLabels)
    .transition("labelUpdate")
    .duration(ANIMATION_DURATION)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .text((d) => d.id)
    .style("opacity", 1)
    .attr("fill", themeColors.nodeTextFill)
    .attr("font-size", (d) => (d.id === focusedNodeId ? "18px" : "14px"))
    .attr("font-weight", (d) => (d.id === focusedNodeId ? "bold" : "normal"));
}
