import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { linkPositionFromEdges, getNodeGroups } from "./drawHelpers";
import { renderCoreDevices } from "./renderCoreDevices";
import {
  setupInteractions,
  drawAllParallelLinks,
  removeAllParallelLinks,
  applyMarkedState,
} from "./handleInteractions";

const NetworkVisualizer = ({
  theme,
  data,
  showDetailedLinks,
  isDrawerOpen = false,
  markedLinkIds = new Set(),
  hoveredLinkId = null,
  onZoneClick,
  onLinkClick,
  onNodeClick,
}) => {
  const svgRef = useRef();
  const markedLinkIdsRef = useRef(markedLinkIds);
  const prevTopologyRef = useRef("");

  useEffect(() => {
    markedLinkIdsRef.current = markedLinkIds;
  }, [markedLinkIds]);

  const palette = useMemo(() => {
    const isDark = theme === "dark";
    return {
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
  }, [theme]);

  // Main graph render & layout effect
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const width = svgElement.clientWidth || window.innerWidth;
    const height = svgElement.clientHeight || window.innerHeight;

    const rawNodes = data.nodes || [];
    const rawLinks = data.links || [];

    if (rawNodes.length === 0) {
      d3.select(svgElement).selectAll("*").remove();
      prevTopologyRef.current = "";
      return;
    }

    const currentTopology = `${rawNodes.length}-${rawLinks.length}-${rawNodes
      .map((n) => n.id)
      .join(",")}-${showDetailedLinks}-${theme}-${isDrawerOpen}-${width}x${height}`;

    const nodes = structuredClone(rawNodes);
    const links = structuredClone(rawLinks);

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
      link.source = nodeMap[link.source] || link.source;
      link.target = nodeMap[link.target] || link.target;
    });

    const svg = d3
      .select(svgElement)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", palette.bg);

    // If topology is unchanged, do a fast data update without tearing down the DOM
    if (prevTopologyRef.current === currentTopology && !svg.select(".main-zoom-layer").empty()) {
      const zoomLayer = svg.select(".main-zoom-layer");
      const linkSelection = zoomLayer.selectAll("line.visible-link").data(links, (d) => d.id);
      const linkHoverSelection = zoomLayer.selectAll("line.link-hover").data(links, (d) => d.id);

      applyMarkedState({
        svg,
        markedLinkIds: markedLinkIdsRef.current,
        hoveredLinkId,
        palette,
        theme,
      });
      return;
    }

    prevTopologyRef.current = currentTopology;
    svg.selectAll("*").remove();

    const zoomLayer = svg.append("g").attr("class", "main-zoom-layer");
    const tooltipLayer = svg.append("g").attr("class", "tooltip-layer-group");

    let parallelLinksAreVisible = false;

    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.05, 8])
      .on("zoom", (event) => {
        const { transform } = event;
        zoomLayer.attr("transform", transform);

        const shouldShowDetailed = showDetailedLinks;

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
            getMarkedLinkIds: () => markedLinkIdsRef.current,
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

      if (NODE_GROUPS && NODE_GROUPS.length > 0) {
        NODE_GROUPS.forEach((zone) => {
          minX = Math.min(minX, zone.cx - 165);
          maxX = Math.max(maxX, zone.cx + 165);
          minY = Math.min(minY, zone.cy - 195);
          maxY = Math.max(maxY, zone.cy + 195);
        });
      }

      const drawerOffset = isDrawerOpen && width > 768 ? 440 : 0;
      const visibleWidth = Math.max(200, width - drawerOffset);

      const dataWidth = maxX - minX;
      const dataHeight = maxY - minY;
      const dataCenterX = minX + dataWidth / 2;
      const dataCenterY = minY + dataHeight / 2;
      const zoomOutFactor = 0.92;
      const paddingFactor = 0.08;
      const padding = Math.min(visibleWidth, height) * paddingFactor;
      const viewWidth = visibleWidth - 2 * padding;
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

      let tx = visibleWidth / 2 - dataCenterX * k;
      let ty = height / 2 - dataCenterY * k;
      const initialTransform = d3.zoomIdentity.translate(tx, ty).scale(k);
      svg.call(zoomBehavior.transform, initialTransform);

      const event = { transform: initialTransform };
      zoomBehavior.on("zoom")(event);
    } else {
      svg.call(zoomBehavior.transform, d3.zoomIdentity);
    }

    setupInteractions({
      link,
      linkHover,
      filteredLinks,
      node,
      tooltip,
      palette,
      zoomLayer,
      onLinkClick,
      getMarkedLinkIds: () => markedLinkIdsRef.current,
    });

    applyMarkedState({
      svg,
      markedLinkIds: markedLinkIdsRef.current,
      hoveredLinkId,
      palette,
      theme,
    });
  }, [onZoneClick, data, palette, onLinkClick, onNodeClick, showDetailedLinks, isDrawerOpen]);

  // Effect to highlight marked and hovered links on the chart
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svg = d3.select(svgElement);
    applyMarkedState({
      svg,
      markedLinkIds,
      hoveredLinkId,
      palette,
      theme,
    });
  }, [markedLinkIds, hoveredLinkId, palette, theme]);

  return (
    <div className="w-full h-full relative">
      <svg
        ref={svgRef}
        className="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-800 transition-colors"
      />
    </div>
  );
};

export default NetworkVisualizer;
