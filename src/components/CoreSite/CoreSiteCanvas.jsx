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
  onNodeClick,
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
      nodeHoverTextFill: theme === "dark" ? "#ffffff" : "#713f12",
      nodeHoverFill: theme === "dark" ? "rgba(234, 179, 8, 0.9)" : "#fde047", // Yellowish, used when a LINK is hovered, for connected nodes
      nodeHoverStroke: "rgba(250, 204, 21, 0.2)", // Yellowish stroke, used when a LINK is hovered
      selectedNodePulseColor: theme === "dark" ? "#2563eb" : "#3b82f6",
      // --- NEW COLOR FOR DIRECT NODE HOVER ---
      nodeHighlightFill: theme === "dark" ? "rgba(234, 179, 8, 0.9)" : "#fde047", // Darker blue for direct node hover
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
      themeColors,
      onLinkClickCallback: onLinkClick,
      onNodeClickCallback: onNodeClick,
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
    themeColors,
    onLinkClick,
    focusedNodeDataRef,
    onNodeClick,
  ]);

  return null;
}
