// SitesBar.jsx
import React from "react";
import * as d3 from "d3";
import { getEdgePoint } from "./drawHelpers";

export default function SitesBar({
  svgRef,
  node4Ref,
  siteRefs,
  theme = "dark",
  onSiteClick, // Add onSiteClick prop
}) {
  const barBgColor = "bg-transparent";

  const buttonDefaultBg = theme === "dark" ? "#29c6e0" : "#e0f2fe"; // cyan-ish for dark, light-blue for light
  const buttonDefaultBorder = theme === "dark" ? "#60a5fa" : "#7dd3fc"; // blue-ish for dark, lighter-blue for light
  const buttonDefaultText = theme === "dark" ? "text-white" : "text-sky-700";

  const buttonHoverBg = theme === "dark" ? "#fde68a" : "#fef9c3"; // yellow-ish for dark, light-yellow for light
  const buttonHoverBorder = theme === "dark" ? "#facc15" : "#fde047"; // amber for dark, lighter-amber for light
  const buttonHoverText =
    theme === "dark" ? "text-slate-800" : "text-yellow-700";

  const connectorLineStroke = theme === "dark" ? "#facc15" : "#f59e0b";

  const handleHover = (hovered, targetButton) => {
    const nodeDefaultFill = theme === "dark" ? "#29c6e0" : "#67e8f9";
    const nodeDefaultStroke = theme === "dark" ? "#60a5fa" : "#7dd3fc";
    const nodeHoverFill = theme === "dark" ? "#fde68a" : "#fef08a";
    const nodeHoverStroke = theme === "dark" ? "#facc15" : "#f59e0b";

    d3.select(svgRef.current)
      .selectAll("circle.node")
      .filter((d) => d.id === "Node 4")
      .attr("fill", hovered ? nodeHoverFill : nodeDefaultFill)
      .attr("stroke", hovered ? nodeHoverStroke : nodeDefaultStroke)
      .attr("stroke-width", hovered ? 4 : 2);

    if (targetButton) {
      targetButton.style.backgroundColor = hovered
        ? buttonHoverBg
        : buttonDefaultBg;
      targetButton.style.borderColor = hovered
        ? buttonHoverBorder
        : buttonDefaultBorder;

      // Ensure classList is available and classes are valid strings
      const defaultTextClass = buttonDefaultText.split(" ")[0]; // Take first class if multiple
      const hoverTextClass = buttonHoverText.split(" ")[0]; // Take first class if multiple

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
      className={`absolute bottom-0 left-0 w-full px-4 py-4 flex flex-wrap justify-center items-center gap-3 ${barBgColor} z-10 shadow-upwards`}
    >
      {Array.from({ length: 80 }).map((_, i) => (
        <button
          key={`btn-${i}`}
          ref={(el) => (siteRefs.current[i] = el)}
          onClick={() => {
            // Add onClick handler
            if (onSiteClick) {
              onSiteClick(i, `Site ${i + 1}`); // Pass site index and a generated name
            }
          }}
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
              60 // Assuming node radius is 60
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
              .lower(); // draw line behind other svg elements if needed
          }}
          onMouseLeave={(e) => {
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
          site {i + 1}
        </button>
      ))}
    </div>
  );
}
