// components/SitesBar.jsx
import React from "react";
import * as d3 from "d3";
import { getEdgePoint } from "./drawHelpers";

export default function SitesBar({
  svgRef,
  node4Ref,
  siteRefs,
  theme = "dark",
}) {
  // Added theme prop with a default
  // Theme-dependent styles
  const barBgColor =
    theme === "dark" ? "bg-slate-900" : "bg-gray-50 border-t border-gray-200";
  const buttonDefaultBg = theme === "dark" ? "#29c6e0" : "#e0f2fe"; // Tailwind: sky-100
  const buttonDefaultBorder = theme === "dark" ? "#60a5fa" : "#7dd3fc"; // Tailwind: sky-300
  const buttonDefaultText = theme === "dark" ? "text-white" : "text-sky-700";

  const buttonHoverBg = theme === "dark" ? "#fde68a" : "#fef9c3"; // Tailwind: yellow-100
  const buttonHoverBorder = theme === "dark" ? "#facc15" : "#fde047"; // Tailwind: yellow-400
  const buttonHoverText =
    theme === "dark" ? "text-slate-800" : "text-yellow-700"; // Ensure good contrast on hover

  const connectorLineStroke = theme === "dark" ? "#facc15" : "#f59e0b"; // Tailwind: amber-500

  const handleHover = (hovered, targetButton) => {
    const nodeDefaultFill = theme === "dark" ? "#29c6e0" : "#67e8f9"; // Match CoreSiteCanvas node fill
    const nodeDefaultStroke = theme === "dark" ? "#60a5fa" : "#7dd3fc"; // Match CoreSiteCanvas node stroke
    const nodeHoverFill = theme === "dark" ? "#fde68a" : "#fef08a"; // Match CoreSiteCanvas hover fill
    const nodeHoverStroke = theme === "dark" ? "#facc15" : "#f59e0b"; // Match CoreSiteCanvas hover stroke

    d3.select(svgRef.current)
      .selectAll("circle.node")
      .filter((d) => d.id === "Node 4")
      .attr("fill", hovered ? nodeHoverFill : nodeDefaultFill)
      .attr("stroke", hovered ? nodeHoverStroke : nodeDefaultStroke)
      .attr("stroke-width", hovered ? 4 : 2);

    // Style the button itself
    if (targetButton) {
      targetButton.style.backgroundColor = hovered
        ? buttonHoverBg
        : buttonDefaultBg;
      targetButton.style.borderColor = hovered
        ? buttonHoverBorder
        : buttonDefaultBorder;
      if (hovered) {
        targetButton.classList.remove(buttonDefaultText.split(" ")[0]); // Remove the static text color class
        targetButton.classList.add(buttonHoverText.split(" ")[0]);
      } else {
        targetButton.classList.remove(buttonHoverText.split(" ")[0]);
        targetButton.classList.add(buttonDefaultText.split(" ")[0]);
      }
    }
  };

  return (
    <div
      className={`absolute bottom-0 w-full px-4 py-4 flex flex-wrap justify-center gap-3 ${barBgColor} z-10 shadow-upwards`}
    >
      {Array.from({ length: 80 }).map((_, i) => (
        <button
          key={`btn-${i}`}
          ref={(el) => (siteRefs.current[i] = el)}
          onMouseEnter={(e) => {
            handleHover(true, e.currentTarget);
            const svg = d3.select(svgRef.current);
            const btnBox = e.currentTarget.getBoundingClientRect();
            const svgBox = svgRef.current.getBoundingClientRect();

            const btnX = btnBox.left + btnBox.width / 2 - svgBox.left;
            const btnY = btnBox.top + btnBox.height / 2 - svgBox.top;

            if (!node4Ref.current) {
              console.warn("[SitesBar] node4Ref.current is not set on hover.");
              return;
            }

            const edge = getEdgePoint(
              node4Ref.current.x,
              node4Ref.current.y,
              btnX,
              btnY,
              60
            );

            svg
              .append("line")
              .attr("id", "active-connector-line")
              .attr("x1", btnX)
              .attr("y1", btnY)
              .attr("x2", edge.x)
              .attr("y2", edge.y)
              .attr("stroke", connectorLineStroke)
              .attr("stroke-width", 3)
              .lower(); // Send to back of current zoomLayer
          }}
          onMouseLeave={(e) => {
            handleHover(false, e.currentTarget);
            d3.select("#active-connector-line").remove();
          }}
          className={`px-4 py-2 rounded ${buttonDefaultText} text-sm transition-colors duration-150 shadow-md`}
          style={{
            backgroundColor: buttonDefaultBg,
            border: `2px solid ${buttonDefaultBorder}`,
          }}
        >
          site {i + 1}
        </button>
      ))}
    </div>
  );
}
