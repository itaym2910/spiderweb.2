// src/components/CoreSite/CoreSiteCanvas.jsx
import React, { useEffect, useMemo } from "react";
import { drawCoreSiteChart } from "./d3CoreSiteRenderer";

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
  const themeColors = useMemo(() => {
    return {
      bgColor: theme === "dark" ? "#1f2937" : "#ffffff",
      zoneCircleFill: theme === "dark" ? "#38bdf8" : "#bae6fd",
      zoneCircleOpacity: theme === "dark" ? 0.12 : 0.4,
      linkStroke: theme === "dark" ? "#94a3b8" : "#cbd5e1",
      linkStrokeOpacity: 0.6,
      linkHoverStroke: "#f59e0b", // Used for link line itself on hover
      nodeFill: theme === "dark" ? "#29c6e0" : "#67e8f9", // Original node blue
      nodeStroke: theme === "dark" ? "#60a5fa" : "#7dd3fc",
      nodeTextFill: theme === "dark" ? "#ffffff" : "#155e75",
      nodeHoverFill: theme === "dark" ? "#fde68a" : "#fef08a", // Yellowish, used when a LINK is hovered, for connected nodes
      nodeHoverStroke: "#f59e0b", // Yellowish stroke, used when a LINK is hovered
      selectedNodePulseColor: theme === "dark" ? "#2563eb" : "#3b82f6",
      // --- NEW COLOR FOR DIRECT NODE HOVER ---
      nodeHighlightFill: theme === "dark" ? "#1d9bb4" : "#4cb9d8", // Darker blue for direct node hover
    };
  }, [theme]);

  useEffect(() => {
    // ... (rest of the useEffect remains the same)
    console.log(
      "[CoreSiteCanvas useEffect] Nodes:",
      nodes ? nodes.map((n) => n.id).join(", ") : "undefined",
      "Links count:",
      links ? links.length : "undefined"
    );
    console.log(
      "[CoreSiteCanvas useEffect] Width:",
      width,
      "Height:",
      height,
      "FocusedNodeId:",
      focusedNodeId
    );

    if (!svgRef.current || width === 0 || height === 0 || !nodes || !links) {
      console.log(
        "[CoreSiteCanvas useEffect] Skipping drawCoreSiteChart due to missing refs, dimensions, or data."
      );
      return;
    }

    console.log("[CoreSiteCanvas useEffect] Calling drawCoreSiteChart.");

    drawCoreSiteChart(svgRef.current, {
      nodesData: nodes,
      linksData: links,
      focusedNodeId,
      width,
      height,
      centerX,
      centerY,
      themeColors, // This now includes nodeHighlightFill
      onLinkClickCallback: onLinkClick,
    });

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
    nodes,
    links,
    focusedNodeId,
    width,
    height,
    centerX,
    centerY,
    themeColors, // Dependency on memoized themeColors
    onLinkClick,
    focusedNodeDataRef,
  ]);

  return null;
}
