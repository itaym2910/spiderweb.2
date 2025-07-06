// SitesBar.jsx
import React from "react";
import * as d3 from "d3";
import { getEdgePoint } from "./drawHelpers";

export default function SitesBar({
  svgRef,
  focusedNodeDataRef, // Renamed from node4Ref, this is the ref object to READ from
  focusedNodeId, // ID of the currently focused node
  siteRefs,
  sites = [],
  theme = "dark",
  onSiteClick,
  // nodes prop might not be needed if focusedNodeDataRef is sufficient
}) {
  const buttonDefaultBg = theme === "dark" ? "#29c6e0" : "#e0f2fe";
  const buttonDefaultBorder = theme === "dark" ? "#60a5fa" : "#7dd3fc";
  const buttonDefaultText = theme === "dark" ? "text-white" : "text-sky-700";

  const buttonHoverBg = theme === "dark" ? "#fde68a" : "#fef9c3";
  const buttonHoverBorder = theme === "dark" ? "#facc15" : "#fde047";
  const buttonHoverText =
    theme === "dark" ? "text-slate-800" : "text-yellow-700";

  const connectorLineStroke = theme === "dark" ? "#facc15" : "#f59e0b";

  const handleHover = (hovered, targetButton) => {
    const nodeDefaultFill = theme === "dark" ? "#29c6e0" : "#67e8f9";
    const nodeDefaultStroke = theme === "dark" ? "#60a5fa" : "#7dd3fc";
    const nodeHoverFill = theme === "dark" ? "#fde68a" : "#fef08a";
    const nodeHoverStroke = theme === "dark" ? "#facc15" : "#f59e0b";

    // Highlight the currently focused node
    if (focusedNodeId) {
      d3.select(svgRef.current)
        .selectAll("circle.node")
        .filter((d) => d.id === focusedNodeId) // Use focusedNodeId
        .attr("fill", hovered ? nodeHoverFill : nodeDefaultFill)
        .attr("stroke", hovered ? nodeHoverStroke : nodeDefaultStroke)
        .attr("stroke-width", hovered ? 4 : 2);
    }

    if (targetButton) {
      targetButton.style.backgroundColor = hovered
        ? buttonHoverBg
        : buttonDefaultBg;
      targetButton.style.borderColor = hovered
        ? buttonHoverBorder
        : buttonDefaultBorder;

      const defaultTextClass = buttonDefaultText.split(" ")[0];
      const hoverTextClass = buttonHoverText.split(" ")[0];

      if (hovered) {
        if (
          defaultTextClass &&
          targetButton.classList.contains(defaultTextClass)
        ) {
          targetButton.classList.remove(defaultTextClass);
        }
        if (
          hoverTextClass &&
          !targetButton.classList.contains(hoverTextClass)
        ) {
          targetButton.classList.add(hoverTextClass);
        }
      } else {
        if (hoverTextClass && targetButton.classList.contains(hoverTextClass)) {
          targetButton.classList.remove(hoverTextClass);
        }
        if (
          defaultTextClass &&
          !targetButton.classList.contains(defaultTextClass)
        ) {
          targetButton.classList.add(defaultTextClass);
        }
      }
    }
  };

  return (
    <div
      className={`absolute bottom-12 left-0 w-full px-4 py-4 flex flex-wrap justify-center items-center gap-3 bg-transparent z-10 shadow-upwards`}
    >
      {sites.map((site, i) => (
        <button
          key={site.id}
          ref={(el) => (siteRefs.current[i] = el)}
          // --- THIS IS THE MODIFIED SECTION ---
          onClick={(e) => {
            // 1. Manually trigger the cleanup logic to remove hover effects IMMEDIATELY.
            //    We pass `false` to revert the styles and provide the button element.
            handleHover(false, e.currentTarget);
            d3.select("#active-connector-line").remove();

            // 2. Perform the original action: open the detail tab.
            if (onSiteClick) {
              onSiteClick(site); // Pass the entire site object to the handler
            }
          }}
          // --- END OF MODIFICATION ---
          onMouseEnter={(e) => {
            handleHover(true, e.currentTarget);
            const svg = d3.select(svgRef.current);
            const btnBox = e.currentTarget.getBoundingClientRect();
            const svgBox = svgRef.current.getBoundingClientRect();

            const btnX = btnBox.left + btnBox.width / 2 - svgBox.left;
            const btnY = btnBox.top + btnBox.height / 2 - svgBox.top;

            if (!focusedNodeDataRef.current) {
              console.warn(
                "[SitesBar] focusedNodeDataRef.current is not set on hover."
              );
              return;
            }

            const nodeData = focusedNodeDataRef.current;
            const edge = getEdgePoint(nodeData.x, nodeData.y, btnX, btnY, 60);

            svg
              .append("line")
              .attr("id", "active-connector-line")
              .attr("x1", btnX)
              .attr("y1", btnY)
              .attr("x2", edge.x)
              .attr("y2", edge.y)
              .attr("stroke", connectorLineStroke)
              .attr("stroke-width", 3)
              .lower();
          }}
          onMouseLeave={(e) => {
            // This remains to handle cases where the user hovers but does NOT click.
            handleHover(false, e.currentTarget);
            d3.select("#active-connector-line").remove();
          }}
          className={`px-4 py-2 rounded ${buttonDefaultText} text-sm font-medium transition-all duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
            theme === "dark" ? "focus:ring-yellow-400" : "focus:ring-amber-500"
          }`}
          style={{
            backgroundColor: buttonDefaultBg,
            border: `2px solid ${buttonDefaultBorder}`,
          }}
        >
          {site.site_name_english}
        </button>
      ))}
    </div>
  );
}
