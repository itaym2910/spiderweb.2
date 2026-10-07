import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";
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
  hoveredFilter = null,
  activeFilter = null,
  pingSubFilter = "all",
  trafficByZone = {},
  onZoneClick,
  onLinkClick,
  onNodeClick,
}) => {
  const svgRef = useRef(null);
  const zoomBehaviorRef = useRef(null);
  const initialTransformRef = useRef(null);
  const markedLinkIdsRef = useRef(markedLinkIds);
  const activeFilterRef = useRef(activeFilter);
  const pingSubFilterRef = useRef(pingSubFilter);
  const themeRef = useRef(theme);
  const prevTopologyRef = useRef("");

  // Navigation & viewport state
  const [currentTransform, setCurrentTransform] = useState({ x: 0, y: 0, k: 1 });
  const [graphLayout, setGraphLayout] = useState({
    nodes: [],
    links: [],
    nodeGroups: [],
    bounds: { minX: 0, maxX: 1000, minY: 0, maxY: 700, width: 1000, height: 700 },
    dimensions: { width: 800, height: 600 },
  });
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isMinimapOpen, setIsMinimapOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    markedLinkIdsRef.current = markedLinkIds;
  }, [markedLinkIds]);

  useEffect(() => {
    activeFilterRef.current = activeFilter;
  }, [activeFilter]);

  useEffect(() => {
    pingSubFilterRef.current = pingSubFilter;
  }, [pingSubFilter]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const palette = useMemo(() => {
    const isDark = theme === "dark";
    return {
      isDark,
      bg: isDark ? "#1f2937" : "#ffffff",
      link: isDark ? "#94a3b8" : "#6b7280",
      node: isDark ? "#29c6e0" : "#29c6e0",
      nodeHoverDirect: isDark ? "rgba(234, 179, 8, 0.9)" : "#fde047",
      stroke: isDark ? "#60a5fa" : "#1d4ed8",
      label: isDark ? "#ffffff" : "#1f2937",
      badgeBg: isDark ? "#0f172a" : "#ffffff",
      badgeStroke: isDark ? "#38bdf8" : "#2563eb",
      badgeHoverBg: isDark ? "#38bdf8" : "#2563eb",
      badgeHoverStroke: isDark ? "#7dd3fc" : "#1d4ed8",
      zone: {
        fill: isDark ? "#38bdf8" : "#7dd3fc",
        opacity: isDark ? 0.12 : 0.25,
        hoverFill: isDark ? "#7dd3fc" : "#bae6fd",
        hoverOpacity: isDark ? 0.25 : 0.4,
      },
      nodeHoverLink: isDark ? "rgba(234, 179, 8, 0.9)" : "#fde047",
      nodeHoverLinkStroke: "rgba(250, 204, 21, 0.2)",
      nodeHoverLinkLabel: isDark ? "#ffffff" : "#713f12",
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

    const trafficKey = Object.entries(trafficByZone || {})
      .map(([k, v]) => `${k}:${v?.traffic?.in}/${v?.traffic?.out}`)
      .join(";");

    const currentTopology = `${rawNodes.length}-${rawLinks.length}-${rawNodes
      .map((n) => n.id)
      .join(",")}-${showDetailedLinks}-${theme}-${isDrawerOpen}-${width}x${height}-${trafficKey}`;

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
      zoomLayer.selectAll("line.visible-link").data(links, (d) => d.id);
      zoomLayer.selectAll("line.link-hover").data(links, (d) => d.id);

      applyMarkedState({
        svg,
        markedLinkIds: markedLinkIdsRef.current,
        hoveredLinkId,
        hoveredFilter,
        activeFilter,
        pingSubFilter,
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

    // Calculate bounding box of diagram
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
        minX = Math.min(minX, zone.cx - 155);
        maxX = Math.max(maxX, zone.cx + 155);
        minY = Math.min(minY, zone.cy - 165);
        maxY = Math.max(maxY, zone.cy + 165);
      });
    }

    const dataWidth = maxX - minX || 1000;
    const dataHeight = maxY - minY || 700;
    const dataCenterX = minX + dataWidth / 2;
    const dataCenterY = minY + dataHeight / 2;

    const boundsObj = {
      minX,
      maxX,
      minY,
      maxY,
      width: dataWidth,
      height: dataHeight,
    };

    setGraphLayout({
      nodes,
      links,
      nodeGroups: NODE_GROUPS,
      bounds: boundsObj,
      dimensions: { width, height },
    });

    // Enhanced D3 Zoom Behavior with bounded physics
    const panMargin = 120;
    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.35, 3.5])
      .translateExtent([
        [minX - panMargin, minY - panMargin],
        [maxX + panMargin, maxY + panMargin],
      ])
      .filter((event) => {
        // Prevent default dblclick zoom so our custom double-click handler manages it
        if (event.type === "dblclick") return false;
        return !event.ctrlKey && !event.button;
      })
      .on("start", () => {
        setIsPanning(true);
      })
      .on("zoom", (event) => {
        const { transform } = event;
        zoomLayer.attr("transform", transform);
        setCurrentTransform({ x: transform.x, y: transform.y, k: transform.k });

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
            getActiveFilter: () => activeFilterRef.current,
            getPingSubFilter: () => pingSubFilterRef.current,
            getTheme: () => themeRef.current,
          });
        } else if (!shouldShowDetailed && parallelLinksAreVisible) {
          parallelLinksAreVisible = false;
          removeAllParallelLinks(zoomLayer);
          link.style("display", null);
          linkHover.style("display", null);
        }
      })
      .on("end", () => {
        setIsPanning(false);
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    const { link, linkHover, node, label, filteredLinks } = renderCoreDevices(
      zoomLayer,
      nodes,
      links,
      NODE_GROUPS,
      palette,
      onZoneClick,
      onNodeClick,
      trafficByZone
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
      const drawerOffset = isDrawerOpen && width > 768 ? 440 : 0;
      const visibleWidth = Math.max(200, width - drawerOffset);

      const zoomOutFactor = 1.0;
      const paddingFactor = 0.03;
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
      initialTransformRef.current = initialTransform;
      setCurrentTransform({ x: tx, y: ty, k });

      svg.call(zoomBehavior.transform, initialTransform);

      const event = { transform: initialTransform };
      zoomBehavior.on("zoom")(event);
    } else {
      svg.call(zoomBehavior.transform, d3.zoomIdentity);
    }

    // Custom double-click handler on empty background:
    // User specification: "if zoomed, fit all; if not zoomed, zoom in"
    svg.on("dblclick.customZoom", function (event) {
      const target = event.target;
      const isBackground =
        target === svgElement ||
        target.tagName === "svg" ||
        target.classList.contains("main-zoom-layer") ||
        target.classList.contains("main-bg");

      if (!isBackground) return;

      event.preventDefault();
      event.stopPropagation();

      const cur = d3.zoomTransform(svgElement);
      const initK = initialTransformRef.current ? initialTransformRef.current.k : 1;
      const isZoomed = cur.k > initK * 1.15;

      if (isZoomed && initialTransformRef.current) {
        // Fit all
        setActiveZoneId(null);
        d3.select(svgElement)
          .transition()
          .duration(400)
          .ease(d3.easeCubicOut)
          .call(zoomBehavior.transform, initialTransformRef.current);
      } else {
        // Zoom in toward pointer
        const [pointerX, pointerY] = d3.pointer(event, svgElement);
        const targetK = Math.min(3.5, cur.k * 1.55);
        const targetTx = pointerX - (pointerX - cur.x) * (targetK / cur.k);
        const targetTy = pointerY - (pointerY - cur.y) * (targetK / cur.k);
        d3.select(svgElement)
          .transition()
          .duration(350)
          .ease(d3.easeCubicOut)
          .call(
            zoomBehavior.transform,
            d3.zoomIdentity.translate(targetTx, targetTy).scale(targetK)
          );
      }
    });

    setupInteractions({
      link,
      linkHover,
      filteredLinks,
      node,
      tooltip,
      tooltipLayer,
      palette,
      zoomLayer,
      onLinkClick,
      getMarkedLinkIds: () => markedLinkIdsRef.current,
      getActiveFilter: () => activeFilterRef.current,
      getPingSubFilter: () => pingSubFilterRef.current,
      getTheme: () => themeRef.current,
    });

    applyMarkedState({
      svg,
      markedLinkIds: markedLinkIdsRef.current,
      hoveredLinkId,
      hoveredFilter,
      activeFilter,
      pingSubFilter,
      palette,
      theme,
    });
  }, [
    onZoneClick,
    data,
    palette,
    onLinkClick,
    onNodeClick,
    showDetailedLinks,
    isDrawerOpen,
    hoveredFilter,
    hoveredLinkId,
    activeFilter,
    pingSubFilter,
    theme,
    trafficByZone,
  ]);

  // Effect to highlight marked and hovered links on the chart
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svg = d3.select(svgElement);
    applyMarkedState({
      svg,
      markedLinkIds,
      hoveredLinkId,
      hoveredFilter,
      activeFilter,
      pingSubFilter,
      palette,
      theme,
    });
  }, [markedLinkIds, hoveredLinkId, hoveredFilter, activeFilter, pingSubFilter, palette, theme]);

  // Navigation handlers
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(250)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.scaleBy, 1.3);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(250)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.scaleBy, 1 / 1.3);
  }, []);

  const handleFitView = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current || !initialTransformRef.current) return;
    setActiveZoneId(null);
    d3.select(svgRef.current)
      .transition()
      .duration(450)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.transform, initialTransformRef.current);
  }, []);

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const cur = d3.zoomTransform(svgRef.current);
    if (Math.abs(cur.k - 1) < 0.05 && initialTransformRef.current) {
      handleFitView();
      return;
    }
    const width = svgRef.current.clientWidth || window.innerWidth;
    const height = svgRef.current.clientHeight || window.innerHeight;
    const cx = width / 2;
    const cy = height / 2;
    const targetK = 1.0;
    const targetTx = cx - (cx - cur.x) * (targetK / cur.k);
    const targetTy = cy - (cy - cur.y) * (targetK / cur.k);
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity.translate(targetTx, targetTy).scale(targetK)
      );
  }, [handleFitView]);

  const handlePanTo = useCallback((newTx, newTy, isSmooth = false) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const cur = d3.zoomTransform(svgRef.current);
    let targetTransform = d3.zoomIdentity.translate(newTx, newTy).scale(cur.k);

    if (zoomBehaviorRef.current.constrain) {
      const constrainFn = zoomBehaviorRef.current.constrain();
      const extent = [
        [0, 0],
        [
          svgRef.current.clientWidth || window.innerWidth,
          svgRef.current.clientHeight || window.innerHeight,
        ],
      ];
      const translateExtent = zoomBehaviorRef.current.translateExtent();
      targetTransform = constrainFn(targetTransform, extent, translateExtent);
    }

    if (isSmooth) {
      d3.select(svgRef.current)
        .transition()
        .duration(350)
        .ease(d3.easeCubicOut)
        .call(zoomBehaviorRef.current.transform, targetTransform);
    } else {
      d3.select(svgRef.current).call(zoomBehaviorRef.current.transform, targetTransform);
    }
  }, []);

  const handleFocusZone = useCallback(
    (zone) => {
      if (!zone || !svgRef.current || !zoomBehaviorRef.current) return;
      const width = svgRef.current.clientWidth || window.innerWidth;
      const height = svgRef.current.clientHeight || window.innerHeight;
      const drawerOffset = isDrawerOpen && width > 768 ? 440 : 0;
      const visibleWidth = Math.max(200, width - drawerOffset);

      setActiveZoneId(zone.id);
      const targetK = 1.45;
      const targetTx = visibleWidth / 2 - zone.cx * targetK;
      const targetTy = height / 2 - zone.cy * targetK;

      let targetTransform = d3.zoomIdentity.translate(targetTx, targetTy).scale(targetK);
      if (zoomBehaviorRef.current.constrain) {
        const constrainFn = zoomBehaviorRef.current.constrain();
        const extent = [
          [0, 0],
          [width, height],
        ];
        const translateExtent = zoomBehaviorRef.current.translateExtent();
        targetTransform = constrainFn(targetTransform, extent, translateExtent);
      }

      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .ease(d3.easeCubicOut)
        .call(zoomBehaviorRef.current.transform, targetTransform);
    },
    [isDrawerOpen]
  );

  // Keyboard navigation shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "f" || e.key === "F" || e.key === "0" || e.key === " ") {
        e.preventDefault();
        handleFitView();
      } else if (e.key.startsWith("Arrow") && svgRef.current && zoomBehaviorRef.current) {
        e.preventDefault();
        const step = 60;
        const cur = d3.zoomTransform(svgRef.current);
        let dx = 0;
        let dy = 0;
        if (e.key === "ArrowLeft") dx = step;
        if (e.key === "ArrowRight") dx = -step;
        if (e.key === "ArrowUp") dy = step;
        if (e.key === "ArrowDown") dy = -step;
        let targetTransform = d3.zoomIdentity.translate(cur.x + dx, cur.y + dy).scale(cur.k);
        if (zoomBehaviorRef.current.constrain) {
          const constrainFn = zoomBehaviorRef.current.constrain();
          const extent = [
            [0, 0],
            [
              svgRef.current.clientWidth || window.innerWidth,
              svgRef.current.clientHeight || window.innerHeight,
            ],
          ];
          const translateExtent = zoomBehaviorRef.current.translateExtent();
          targetTransform = constrainFn(targetTransform, extent, translateExtent);
        }
        d3.select(svgRef.current)
          .transition()
          .duration(100)
          .call(
            zoomBehaviorRef.current.transform,
            targetTransform
          );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleFitView]);

  const zoomPercent = Math.round((currentTransform.k || 1) * 100);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background SVG Canvas */}
      <svg
        ref={svgRef}
        className={`absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-800 transition-colors topology-chart-svg ${isPanning ? "is-panning" : ""
          }`}
      />
    </div>
  );
};

export default NetworkVisualizer;
