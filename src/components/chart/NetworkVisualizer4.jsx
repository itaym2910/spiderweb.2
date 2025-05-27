import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { NODES4, LINKS4 } from "./constants4";
import { linkPositionFromEdges, getClusterGroups } from "./drawHelpers";
import { renderCoreDevices } from "./renderCoreDevices";
import { setupInteractions } from "./handleInteractions";

const NetWorkVisualizer4 = () => {
  const svgRef = useRef();

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const mo = new MutationObserver((mutations) => {
      for (let m of mutations) {
        if (m.attributeName === "class") {
          setIsDark(document.documentElement.classList.contains("dark"));
          break;
        }
      }
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    const theme = {
      background: isDark ? "#1f2937" : "#ffffff",
      zoneFill: isDark ? "#38bdf8" : "#0284c7",
      zoneOpacity: 0.12,
      labelColor: isDark ? "#ffffff" : "#000000",
      linkStroke: isDark ? "#94a3b8" : "#475569",
      linkOpacity: 0.6,
      nodeFill: isDark ? "#29c6e0" : "#22d3ee",
      nodeStroke: isDark ? "#60a5fa" : "#0ea5e9",
      nodeStrokeWidth: 2,
      tooltipColor: isDark ? "#ffffff" : "#000000",
      linkHighlight: isDark ? "#facc15" : "#eab308",
      linkStrokeWidth: 2,
      nodeHighlightFill: isDark ? "#fde68a" : "#fde047",
      nodeHighlightStroke: isDark ? "#facc15" : "#ca8a04",
      nodeHighlightWidth: 4,
    };

    const nodes = structuredClone(NODES4);
    const links = structuredClone(LINKS4);
    const CLUSTER_GROUPS = getClusterGroups(nodes); // will pick up 4 zones

    // position clusters along tangents exactly as before
    const nodeMap = {};
    CLUSTER_GROUPS.forEach((zone) => {
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

    const svg = d3
      .select(svgRef.current)
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)
      .style("background-color", theme.background);
    svg.selectAll("*").remove();
    const tooltipLayer = svg.append("g"),
      zoomLayer = svg.append("g");

    svg.call(
      d3
        .zoom()
        .scaleExtent([0.5, 4])
        .on("zoom", ({ transform }) => zoomLayer.attr("transform", transform))
    );

    const { link, linkHover, node, label, filteredLinks } = renderCoreDevices(
      zoomLayer,
      nodes,
      links,
      CLUSTER_GROUPS,
      theme
    );

    const tooltip = tooltipLayer
      .append("text")
      .attr("class", "svg-tooltip")
      .attr("fill", theme.tooltipColor)
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

    requestAnimationFrame(() =>
      setupInteractions({ link, linkHover, filteredLinks, node, tooltip })
    );
  }, [isDark]);

  return <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full" />;
};

export default NetWorkVisualizer4;
