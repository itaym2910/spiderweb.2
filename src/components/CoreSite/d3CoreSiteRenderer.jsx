// src/components/CoreSite/d3CoreSiteRenderer.js
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
    onNodeClickCallback,
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

    // Create groups for drawing order - CORRECTED ORDER
    zoomLayer.append("g").attr("class", "links-group");
    zoomLayer.append("g").attr("class", "link-hover-group"); // MOVED UP
    zoomLayer.append("g").attr("class", "pulse-group");
    zoomLayer.append("g").attr("class", "nodes-group");
    zoomLayer.append("g").attr("class", "node-labels-group");
  }

  const pulseGroup = zoomLayer.select("g.pulse-group");
  const linksGroup = zoomLayer.select("g.links-group");
  const nodesGroup = zoomLayer.select("g.nodes-group");
  const linkHoverGroup = zoomLayer.select("g.link-hover-group");
  const nodeLabelsGroup = zoomLayer.select("g.node-labels-group");

  // --- Pulsing Circle for Selected Node ---
  const selectedNodeDataArray = focusedNodeId
    ? nodesData.filter((n) => n.id === focusedNodeId)
    : [];

  const pulseCircles = pulseGroup
    .selectAll("circle.node-pulse")
    .data(selectedNodeDataArray, (d) => d.id);

  pulseCircles
    .exit()
    .interrupt(PULSE_ANIMATION_NAME)
    .transition("pulseExit")
    .duration(ANIMATION_DURATION / 2)
    .attr("r", 0)
    .style("opacity", 0)
    .remove();

  const pulseEnter = pulseCircles
    .enter()
    .append("circle")
    .attr("class", "node-pulse")
    .attr("r", 0)
    .style("opacity", 0)
    .attr("fill", themeColors.selectedNodePulseColor)
    .attr("stroke", themeColors.selectedNodePulseColor)
    .attr("stroke-width", 2);

  pulseEnter
    .merge(pulseCircles)
    .interrupt(PULSE_ANIMATION_NAME)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .transition("pulseMoveAppear")
    .duration(ANIMATION_DURATION)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 60)
    .style("opacity", 0.7)
    .on("end.startPulseEffect", function (d) {
      const circle = d3.select(this);
      function continuousPulse() {
        if (circle.empty() || focusedNodeId !== d.id) {
          circle.interrupt(PULSE_ANIMATION_NAME);
          return;
        }
        circle
          .transition(PULSE_ANIMATION_NAME)
          .duration(1000)
          .attr("r", 60 + 10)
          .style("opacity", 0.3)
          .transition(PULSE_ANIMATION_NAME)
          .duration(1000)
          .attr("r", 60)
          .style("opacity", 0.7)
          .on("end.continuousPulse", continuousPulse);
      }
      continuousPulse();
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
    .attr("x1", (d) =>
      d.source && nodesData.find((n) => n.id === d.source.id)
        ? linkPositionFromEdges(d, 60).x1
        : (d.source && d.source.x) || 0
    )
    .attr("y1", (d) =>
      d.source && nodesData.find((n) => n.id === d.source.id)
        ? linkPositionFromEdges(d, 60).y1
        : (d.source && d.source.y) || 0
    )
    .attr("x2", (d) =>
      d.target && nodesData.find((n) => n.id === d.target.id)
        ? linkPositionFromEdges(d, 60).x2
        : (d.target && d.target.x) || 0
    )
    .attr("y2", (d) =>
      d.target && nodesData.find((n) => n.id === d.target.id)
        ? linkPositionFromEdges(d, 60).y2
        : (d.target && d.target.y) || 0
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
        ? themeColors.selectedNodePulseColor
        : themeColors.nodeStroke
    )
    .attr("stroke-width", (d) => (d.id === focusedNodeId ? 3 : 2));

  nodesGroup
    .selectAll("circle.node")
    .style("cursor", "pointer")
    .on("mouseover.nodehighlight", function () {
      const currentNodeSelection = d3.select(this);
      const currentFill = currentNodeSelection.attr("fill");
      if (currentFill !== themeColors.nodeHoverFill) {
        currentNodeSelection.attr("fill", themeColors.nodeHighlightFill);
      }
    })
    .on("mouseout.nodehighlight", function () {
      const currentNodeSelection = d3.select(this);
      const currentFill = currentNodeSelection.attr("fill");
      if (currentFill === themeColors.nodeHighlightFill) {
        currentNodeSelection.attr("fill", themeColors.nodeFill);
      }
    })
    .on("click.nodeaction", function (event, d_clicked_node) {
      console.log("CoreSitePage - Node clicked in D3:", d_clicked_node.id);
      event.stopPropagation();
      if (onNodeClickCallback) {
        onNodeClickCallback(d_clicked_node);
      }
    });

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
      // Highlight the link itself
      linksGroup
        .selectAll("line.link")
        .filter((l) => l.id === d_hovered_link.id)
        .attr("stroke", themeColors.linkHoverStroke)
        .attr("stroke-width", 4);
      // Highlight connected nodes with yellowish color
      nodesGroup
        .selectAll("circle.node")
        .filter(
          (n) =>
            n.id === d_hovered_link.source.id ||
            n.id === d_hovered_link.target.id
        )
        .attr("fill", themeColors.nodeHoverFill) // Yellowish for link-connected nodes
        .attr("stroke", themeColors.nodeHoverStroke);
    })
    .on("mouseout", function (event, d_hovered_link) {
      // Reset the link itself
      linksGroup
        .selectAll("line.link")
        .filter((l) => l.id === d_hovered_link.id)
        .attr("stroke", themeColors.linkStroke)
        .style("opacity", themeColors.linkStrokeOpacity)
        .attr("stroke-width", 2);

      // Reset connected nodes
      nodesGroup
        .selectAll("circle.node")
        .filter(
          (n) =>
            n.id === d_hovered_link.source.id ||
            n.id === d_hovered_link.target.id
        )
        .each(function () {
          const nodeElement = d3.select(this);
          // If the mouse is now directly over this node, the node's own mouseover
          // will handle its highlight (darker blue). Otherwise, revert to default.
          // A simple way is to check if relatedTarget is this node.
          // For now, let's unconditionally revert from yellow. Node's own mouseover will take over if needed.
          if (nodeElement.attr("fill") === themeColors.nodeHoverFill) {
            // Only revert if it was yellow
            nodeElement.attr("fill", themeColors.nodeFill); // Default blue
          }
        })
        .attr(
          "stroke",
          (
            n // Also reset stroke
          ) =>
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
      event.stopPropagation(); // Good practice for clickable items in a zoomable area
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
    .style("pointer-events", "none") // Prevent labels from interfering
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
