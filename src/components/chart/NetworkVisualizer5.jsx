import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { NODES5, LINKS5 } from "./constants5";
import { linkPositionFromEdges, getNodeGroups } from "./drawHelpers";
import { renderCoreDevices } from "./renderCoreDevices";
import { setupInteractions } from "./handleInteractions";

const NetworkVisualizer5 = ({ theme, data, onZoneClick, onLinkClick }) => {
  const svgRef = useRef();
  console.log(
    "[NetworkVisualizer5] Received onZoneClick prop. Type:",
    typeof onZoneClick
  );

  useEffect(() => {
    console.log(
      "[NetworkVisualizer5 useEffect] onZoneClick type:",
      typeof onZoneClick
    );
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const width = svgElement.clientWidth || window.innerWidth;
    const height = svgElement.clientHeight || window.innerHeight;

    const nodes = structuredClone(NODES5);
    const links = structuredClone(LINKS5);
    const NODE_GROUPS = getNodeGroups(nodes);

    const nodeMap = {};
    NODE_GROUPS.forEach((zone) => {
      const zoneNodes = nodes.filter((n) => n.zone === zone.id);
      const baseAngle = zone.angle;
      const perp = baseAngle + Math.PI / 2;
      const spacing = 140;
      zoneNodes.forEach((n, i) => {
        const offset = (i - (zoneNodes.length - 1) / 2) * spacing;
        n.x = zone.cx + offset * Math.cos(perp);
        n.y = zone.cy + offset * Math.sin(perp);
        nodeMap[n.id] = n;
      });
    });
    links.forEach((l) => {
      l.source = nodeMap[l.source];
      l.target = nodeMap[l.target];
    });

    const isDark = theme === "dark";
    const palette = {
      bg: isDark ? "#1f2937" : "#ffffff",
      link: isDark ? "#94a3b8" : "#6b7280",
      node: isDark ? "#29c6e0" : "#29c6e0",
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

    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.05, 8]) // Allow even more zoom out if needed
      .on("zoom", ({ transform }) => {
        zoomLayer.attr("transform", transform);
      });

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

    // --- Calculate and Apply Initial Transform to Center Content ---
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
      const zoomOutFactor = 0.9; // e.g., 0.7 means zoom out to 70% of the auto-fit scale
      const verticalScreenOffset = 9; // e.g., 50 pixels down from the center

      // Padding: adjust as needed, or make it dependent on the zoomOutFactor
      const paddingFactor = 0.15; // e.g. 15% padding
      const padding = Math.min(width, height) * paddingFactor;
      const viewWidth = width - 2 * padding;
      const viewHeight = height - 2 * padding;

      let k = 1;

      if (dataWidth > 0 && dataHeight > 0) {
        k = Math.min(viewWidth / dataWidth, viewHeight / dataHeight);
      } else if (dataWidth > 0) {
        k = viewWidth / dataWidth;
      } else if (dataHeight > 0) {
        k = viewHeight / dataHeight;
      }

      // Apply the zoom out factor
      k *= zoomOutFactor;

      const [minScale, maxScale] = zoomBehavior.scaleExtent();
      k = Math.max(minScale, Math.min(maxScale, k));

      // Calculate translation to center the content
      let tx = width / 2 - dataCenterX * k;
      let ty = height / 2 - dataCenterY * k;

      // Apply the vertical offset (shifts the content down on the screen)
      ty += verticalScreenOffset;

      const initialTransform = d3.zoomIdentity.translate(tx, ty).scale(k);
      svg.call(zoomBehavior.transform, initialTransform);
    } else {
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
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-800"
    />
  );
};

export default NetworkVisualizer5;
