// SitesBar.jsx
import React from "react";
import * as d3 from "d3";
import { getEdgePoint } from "./drawHelpers";

export default function SitesBar({
  svgRef,
  node4Ref,
  siteRefs,
  theme = "dark", // theme prop is already here, which is good
}) {
  // Theme-dependent styles for the bar itself
  // --- CHANGE THIS LINE ---
  const barBgColor = "bg-transparent"; // Always transparent, regardless of theme
  // --- END OF CHANGE ---

  // Theme-dependent styles for buttons WITHIN the bar
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

      const defaultTextClass = buttonDefaultText.split(" ")[0];
      const hoverTextClass = buttonHoverText.split(" ")[0];

      if (hovered) {
        if (defaultTextClass) targetButton.classList.remove(defaultTextClass);
        if (hoverTextClass) targetButton.classList.add(hoverTextClass);
      } else {
        if (hoverTextClass) targetButton.classList.remove(hoverTextClass);
        if (defaultTextClass) targetButton.classList.add(defaultTextClass);
      }
    }
  };

  return (
    <div
      className={`absolute bottom-0 w-full px-4 py-4 flex flex-wrap justify-center gap-3 ${barBgColor} z-10 shadow-upwards`}
    >
      {/* ... rest of the component ... */}
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
              .lower();
          }}
          onMouseLeave={(e) => {
            handleHover(false, e.currentTarget);
            d3.select("#active-connector-line").remove();
          }}
          className={`px-4 py-2 rounded ${buttonDefaultText} text-sm transition-colors duration-150 shadow-md`} // Individual buttons still have their shadow
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
