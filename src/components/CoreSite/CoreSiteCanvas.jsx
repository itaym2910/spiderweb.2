// components/CoreSiteCanvas.jsx
import React, { useEffect, useMemo } from "react"; // Added useMemo
// import * as d3 from "d3"; // d3 is now encapsulated in the renderer
// import { linkPositionFromEdges } from "./drawHelpers"; // Also encapsulated
import { drawCoreSiteChart } from "./d3CoreSiteRenderer"; // Import the new renderer

export default function CoreSiteCanvas({
  svgRef,
  focusedNodeDataRef,
  focusedNodeId,
  nodes,
  links,
  centerX,
  centerY,
  width,
  height,

  theme = "dark",
  onLinkClick,
}) {
  // Memoize theme colors to prevent unnecessary re-renders if theme string doesn't change
  const themeColors = useMemo(() => {
    return {
      bgColor: theme === "dark" ? "#1f2937" : "#ffffff",
      zoneCircleFill: theme === "dark" ? "#38bdf8" : "#bae6fd",
      zoneCircleOpacity: theme === "dark" ? 0.12 : 0.4,
      linkStroke: theme === "dark" ? "#94a3b8" : "#cbd5e1",
      linkStrokeOpacity: 0.6,
      linkHoverStroke: "#f59e0b",
      nodeFill: theme === "dark" ? "#29c6e0" : "#67e8f9",
      nodeStroke: theme === "dark" ? "#60a5fa" : "#7dd3fc",
      nodeTextFill: theme === "dark" ? "#ffffff" : "#155e75",
      nodeHoverFill: theme === "dark" ? "#fde68a" : "#fef08a",
      nodeHoverStroke: "#f59e0b",
      selectedNodePulseColor: theme === "dark" ? "#2563eb" : "#3b82f6",
    };
  }, [theme]);

  useEffect(() => {
    if (!svgRef.current || width === 0 || height === 0 || !nodes || !links) {
      // Added checks for nodes/links
      return;
    }

    // Configure and call the D3 renderer
    drawCoreSiteChart(svgRef.current, {
      nodesData: nodes,
      linksData: links,
      focusedNodeId,
      width,
      height,
      centerX,
      centerY,
      // currentZoneId, // Pass if needed by renderer for any non-visual logic
      themeColors,
      onLinkClickCallback: onLinkClick, // Pass the callback
    });

    // Update focusedNodeDataRef (this logic remains in the React component)
    if (focusedNodeDataRef && nodes && nodes.length > 0 && focusedNodeId) {
      const foundNode = nodes.find((n) => n.id === focusedNodeId);
      focusedNodeDataRef.current = foundNode || null;
      if (!foundNode) {
        console.warn(
          `[CoreSiteCanvas] Node ${focusedNodeId} not found in nodes data`
        );
      }
    } else if (focusedNodeDataRef) {
      focusedNodeDataRef.current = null;
    }
  }, [
    svgRef,
    nodes, // Add nodes to dependency array
    links, // Add links to dependency array
    focusedNodeId,
    width,
    height,
    centerX,
    centerY,
    themeColors, // Use memoized themeColors
    onLinkClick,
    focusedNodeDataRef,
    // currentZoneId, // Add if it's passed to drawCoreSiteChart and can change
  ]);

  // The component now only returns null as SVG is managed by ref and D3
  return null;
}
