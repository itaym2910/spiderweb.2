import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { linkPositionFromEdges, getNodeGroups } from "./drawHelpers";
import { renderCoreDevices } from "./renderCoreDevices";
import {
  setupInteractions,
  drawAllParallelLinks,
  removeAllParallelLinks,
} from "./handleInteractions";

// +++ ADD `showDetailedLinks` TO THE PROPS
const NetworkVisualizer5 = ({
  theme,
  data,
  showDetailedLinks,
  onZoneClick,
  onLinkClick,
  onNodeClick,
}) => {
  const svgRef = useRef();

  // +++ ADD `showDetailedLinks` TO THE DEPENDENCY ARRAY
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const width = svgElement.clientWidth || window.innerWidth;
    const height = svgElement.clientHeight || window.innerHeight;

    // ... (rest of the initial setup logic is unchanged)
    const nodes = structuredClone(data.nodes || []);
    const links = structuredClone(data.links || []);

    if (nodes.length === 0) {
      d3.select(svgElement).selectAll("*").remove();
      return;
    }

    // ... (palette and node/link processing is unchanged)
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
      nodeHoverDirect: isDark ? "#1d9bb4" : "#22b8d4",
      stroke: isDark ? "#60a5fa" : "#1d4ed8",
      label: isDark ? "#ffffff" : "#1f2937",
      zone: {
        fill: isDark ? "#38bdf8" : "#7dd3fc",
        opacity: isDark ? 0.12 : 0.25,
        hoverFill: isDark ? "#7dd3fc" : "#bae6fd",
        hoverOpacity: isDark ? 0.25 : 0.4,
      },
      nodeHoverLink: isDark ? "#fde68a" : "#fef08a",
      nodeHoverLinkStroke: isDark ? "#facc15" : "#f59e0b",
      status: {
        up: isDark ? "#4ade80" : "#22c55e",
        down: isDark ? "#f87171" : "#ef4444",
        issue: isDark ? "#facc15" : "#f59e0b",
      },
    };

    const svg = d3
      .select(svgElement)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", palette.bg);

    svg.selectAll("*").remove();
    const zoomLayer = svg.append("g").attr("class", "main-zoom-layer");
    const tooltipLayer = svg.append("g").attr("class", "tooltip-layer-group");

    const ZOOM_THRESHOLD = 1.5;
    let parallelLinksAreVisible = false;

    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.05, 8])
      .on("zoom", (event) => {
        const { transform } = event;
        zoomLayer.attr("transform", transform);

        // +++ MODIFY THE CONDITION TO INCLUDE THE PROP
        const shouldShowDetailed =
          transform.k >= ZOOM_THRESHOLD || showDetailedLinks;

        if (shouldShowDetailed && !parallelLinksAreVisible) {
          parallelLinksAreVisible = true;
          link.style("display", "none");
          linkHover.style("display", "none");
          drawAllParallelLinks({
            zoomLayer,
            allNodes: node.data(),
            filteredLinks,
            tooltip,
            palette,
            onLinkClick,
            linkSelection: link,
          });
        } else if (!shouldShowDetailed && parallelLinksAreVisible) {
          parallelLinksAreVisible = false;
          removeAllParallelLinks(zoomLayer);
          link.style("display", null);
          linkHover.style("display", null);
        }
      });

    svg.call(zoomBehavior);

    const { link, linkHover, node, label, filteredLinks } = renderCoreDevices(
      zoomLayer,
      nodes,
      links,
      NODE_GROUPS,
      palette,
      onZoneClick,
      onNodeClick
    );

    // ... (rest of the rendering logic is unchanged)
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
      .attr("fill", palette.label)
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

    if (nodes.length > 0) {
      // ... (initial transform calculation is unchanged) ...
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
      const zoomOutFactor = 0.9;
      const verticalScreenOffset = 9;
      const paddingFactor = 0.15;
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
      k *= zoomOutFactor;
      const [minScale, maxScale] = zoomBehavior.scaleExtent();
      k = Math.max(minScale, Math.min(maxScale, k));
      let tx = width / 2 - dataCenterX * k;
      let ty = height / 2 - dataCenterY * k;
      ty += verticalScreenOffset;
      const initialTransform = d3.zoomIdentity.translate(tx, ty).scale(k);
      svg.call(zoomBehavior.transform, initialTransform);

      // +++ MODIFY THE INITIAL CHECK TO INCLUDE THE PROP
      if (k >= ZOOM_THRESHOLD || showDetailedLinks) {
        const event = { transform: initialTransform };
        zoomBehavior.on("zoom")(event);
      }
    } else {
      svg.call(zoomBehavior.transform, d3.zoomIdentity);
    }

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
  }, [onZoneClick, data, theme, onLinkClick, onNodeClick, showDetailedLinks]); // <<< Added prop to dependency array

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-800"
    />
  );
};

export default NetworkVisualizer5;
