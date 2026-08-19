import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { linkPositionFromEdges, getNodeGroups } from "./drawHelpers";
import { renderCoreDevices } from "./renderCoreDevices";
import {
  setupInteractions,
  drawAllParallelLinks,
  removeAllParallelLinks,
} from "./handleInteractions";

const NetworkVisualizer5 = ({
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

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const width = svgElement.clientWidth || window.innerWidth;
    const height = svgElement.clientHeight || window.innerHeight;

    const nodes = structuredClone(data.nodes || []);
    const links = structuredClone(data.links || []);

    if (nodes.length === 0) {
      d3.select(svgElement).selectAll("*").remove();
      return;
    }

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
  }, [onZoneClick, data, theme, onLinkClick, onNodeClick, showDetailedLinks, isDrawerOpen]);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svg = d3.select(svgElement);
    const isDark = theme === "dark";
    const defaultLinkColor = isDark ? "#94a3b8" : "#6b7280";
    const defaultNodeColor = "#29c6e0";
    const defaultNodeStroke = isDark ? "#60a5fa" : "#1d4ed8";

    const hasMarked =
      (markedLinkIds && markedLinkIds.size > 0) || Boolean(hoveredLinkId);

    if (!hasMarked) {
      svg
        .selectAll("line.visible-link")
        .transition()
        .duration(200)
        .attr("stroke", defaultLinkColor)
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2);

      svg
        .selectAll("circle.node")
        .transition()
        .duration(200)
        .style("opacity", 0.9)
        .attr("fill", defaultNodeColor)
        .attr("stroke", defaultNodeStroke)
        .attr("stroke-width", 2);

      svg
        .selectAll("path.duplicate-link")
        .transition()
        .duration(200)
        .attr("stroke-opacity", 1.0)
        .attr("stroke-width", 3);

      svg
        .selectAll("text.label")
        .transition()
        .duration(200)
        .style("opacity", 1);
      return;
    }

    const activeEndpoints = new Set();
    const markedIdsSet = new Set(markedLinkIds || []);
    if (hoveredLinkId) markedIdsSet.add(hoveredLinkId);

    svg.selectAll("line.visible-link").each(function (d) {
      if (!d) return;
      const isMarked = markedIdsSet.has(d.id);
      const isDown =
        (d.status || d.physical_status || d.category || "").toLowerCase() === "down";
      const isIssue =
        (d.status || d.physical_status || d.category || "").toLowerCase() === "issue";
      const highlightColor = isDown ? "#ef4444" : isIssue ? "#f59e0b" : "#10b981";

      const sourceId = typeof d.source === "object" ? d.source.id : d.source;
      const targetId = typeof d.target === "object" ? d.target.id : d.target;

      if (isMarked) {
        activeEndpoints.add(sourceId);
        activeEndpoints.add(targetId);

        d3.select(this)
          .raise()
          .transition()
          .duration(200)
          .attr("stroke", highlightColor)
          .attr("stroke-opacity", 1)
          .attr("stroke-width", 4.5);
      } else {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", defaultLinkColor)
          .attr("stroke-opacity", 0.12)
          .attr("stroke-width", 1.5);
      }
    });

    svg.selectAll("path.duplicate-link").each(function (d) {
      if (!d) return;
      const isMarked = markedIdsSet.has(d.id);
      const isDown =
        (d.status || d.physical_status || d.category || "").toLowerCase() === "down";
      const isIssue =
        (d.status || d.physical_status || d.category || "").toLowerCase() === "issue";
      const highlightColor = isDown ? "#ef4444" : isIssue ? "#f59e0b" : "#10b981";

      const sourceId = typeof d.source === "object" ? d.source.id : d.source;
      const targetId = typeof d.target === "object" ? d.target.id : d.target;

      if (isMarked) {
        activeEndpoints.add(sourceId);
        activeEndpoints.add(targetId);

        d3.select(this)
          .raise()
          .transition()
          .duration(200)
          .attr("stroke", highlightColor)
          .attr("stroke-opacity", 1)
          .attr("stroke-width", 4.5);
      } else {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", defaultLinkColor)
          .attr("stroke-opacity", 0.12)
          .attr("stroke-width", 1.5);
      }
    });

    svg.selectAll("circle.node").each(function (d) {
      if (!d) return;
      const isEndpoint = activeEndpoints.has(d.id);
      if (isEndpoint) {
        d3.select(this)
          .raise()
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("fill", "#fef08a")
          .attr("stroke", "#f59e0b")
          .attr("stroke-width", 3.5);
      } else {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.25)
          .attr("fill", defaultNodeColor)
          .attr("stroke", defaultNodeStroke)
          .attr("stroke-width", 2);
      }
    });

    svg.selectAll("text.label").each(function (d) {
      if (!d) return;
      const isEndpoint = activeEndpoints.has(d.id);
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", isEndpoint ? 1 : 0.3)
        .attr("font-weight", isEndpoint ? "bold" : "normal");
    });
  }, [markedLinkIds, hoveredLinkId, theme]);

  return (
    <div className="w-full h-full relative">
      <svg
        ref={svgRef}
        className="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-800 transition-colors"
      />
    </div>
  );
};

export default NetworkVisualizer5;
