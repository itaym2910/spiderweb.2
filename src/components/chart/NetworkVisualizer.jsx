import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { NODES, LINKS } from "./constants"; // Assuming these are your data files
import { linkPositionFromEdges, getNodeGroups } from "./drawHelpers";
import { renderCoreDevices } from "./renderCoreDevices";
import { setupInteractions } from "./handleInteractions";

const NetworkVisualizer = ({ theme, data, onZoneClick, onLinkClick }) => {
  console.log(
    "[NetworkVisualizer] Component rendering. Received onZoneClick prop. Type:",
    typeof onZoneClick
  );
  const svgRef = useRef();

  useEffect(() => {
    console.log(
      "[NetworkVisualizer useEffect] Inside useEffect. onZoneClick type:",
      typeof onZoneClick
    );
    const svgElement = svgRef.current;
    if (!svgElement) return; // Guard if ref not yet available

    // Use clientWidth/Height for more accurate SVG dimensions
    const width = svgElement.clientWidth || window.innerWidth;
    const height = svgElement.clientHeight || window.innerHeight;

    const nodes = structuredClone(NODES);
    const links = structuredClone(LINKS);
    const NODE_GROUPS = getNodeGroups(nodes);

    const nodeMap = {};
    NODE_GROUPS.forEach((zone) => {
      const zoneNodes = nodes.filter((n) => n.zone === zone.id);
      const baseAngle = zone.angle;
      const perpendicularAngle = baseAngle + Math.PI / 2;
      const spacing = 140;
      const radiusFromZone = 0;

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

    links.forEach((link) => {
      link.source = nodeMap[link.source];
      link.target = nodeMap[link.target];
    });

    const isDark = theme === "dark";
    const palette = {
      bg: isDark ? "#1f2937" : "#ffffff",
      link: isDark ? "#94a3b8" : "#6b7280",
      node: isDark ? "#29c6e0" : "#29c6e0",
      nodeHoverDirect: isDark ? "#1d9bb4" : "#22b8d4",
      stroke: isDark ? "#60a5fa" : "#1d4ed8",
      label: isDark ? "#ffffff" : "#1f2937",
    };

    const svg = d3
      .select(svgElement)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", palette.bg);

    svg.selectAll("*").remove();
    const tooltipLayer = svg.append("g");
    const zoomLayer = svg.append("g").attr("class", "main-zoom-layer");

    // 1. Define and store the zoom behavior
    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.05, 8]) // Adjusted scaleExtent, can be tuned
      .on("zoom", ({ transform }) => {
        zoomLayer.attr("transform", transform); // zoomLayer is transformed
      });
    // Apply the zoom behavior to the SVG
    svg.call(zoomBehavior);

    const { link, linkHover, node, label, filteredLinks } = renderCoreDevices(
      zoomLayer,
      nodes,
      links,
      NODE_GROUPS,
      palette,
      onZoneClick
    );

    link.attr("stroke", palette.link);
    node.attr("fill", palette.node).attr("stroke", palette.stroke);
    label.attr("fill", palette.label);

    const tooltip = tooltipLayer
      .append("text")
      .attr("class", "svg-tooltip")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "start")
      .attr("font-size", 14)
      .attr("fill", palette.label) // Use palette for tooltip color
      .attr("opacity", 0)
      .style("pointer-events", "none")
      .style("user-select", "none");

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

    // --- Calculate and Apply Initial Transform to Center and Adjust Content ---
    if (nodes.length > 0) {
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;

      nodes.forEach((n) => {
        if (n.x < minX) minX = n.x;
        if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
      });

      const dataWidth = maxX - minX;
      const dataHeight = maxY - minY;
      const dataCenterX = minX + dataWidth / 2;
      const dataCenterY = minY + dataHeight / 2;

      // --- ADJUSTMENTS FOR ZOOM AND POSITION ---
      const zoomOutFactor = 0.9; // Zoom out further (e.g., 0.7 = 70% of auto-fit scale)
      const verticalScreenOffset = 0; // Shift down by 50 pixels from the calculated center

      const paddingFactor = 0.15; // 15% padding around the content
      const padding = Math.min(width, height) * paddingFactor;
      const viewWidth = width - 2 * padding;
      const viewHeight = height - 2 * padding;

      let k = 1; // Default scale

      if (dataWidth > 0 && dataHeight > 0) {
        k = Math.min(viewWidth / dataWidth, viewHeight / dataHeight);
      } else if (dataWidth > 0) {
        // Content is a horizontal line
        k = viewWidth / dataWidth;
      } else if (dataHeight > 0) {
        // Content is a vertical line
        k = viewHeight / dataHeight;
      }
      // If dataWidth and dataHeight are 0 (single point), k remains 1

      // Apply the zoom out factor
      k *= zoomOutFactor;

      // Ensure scale is within defined extents
      const [minScale, maxScale] = zoomBehavior.scaleExtent();
      k = Math.max(minScale, Math.min(maxScale, k));

      // Calculate translation to center the content based on its bounding box
      let tx = width / 2 - dataCenterX * k;
      let ty = height / 2 - dataCenterY * k;

      // Apply the vertical offset (shifts the content down on the screen)
      ty += verticalScreenOffset;

      const initialTransform = d3.zoomIdentity.translate(tx, ty).scale(k);

      // Apply this transform to the SVG element that has the zoom behavior
      // This will also trigger the "zoom" event, setting the zoomLayer's transform
      svg.call(zoomBehavior.transform, initialTransform);
    } else {
      // Fallback if no nodes: just use identity transform (no zoom/pan)
      svg.call(zoomBehavior.transform, d3.zoomIdentity);
    }
    // --- End Initial Transform ---

    requestAnimationFrame(() =>
      setupInteractions({
        link,
        linkHover,
        filteredLinks,
        node,
        tooltip,
        palette,
        zoomLayer,
        onLinkClick,
      })
    );
  }, [onZoneClick, data, theme, onLinkClick]);

  return (
    <div>
      <svg
        ref={svgRef}
        className="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-800"
      />
    </div>
  );
};

export default NetworkVisualizer;
