import React from "react";
import * as d3 from "d3";
import { getEdgePoint } from "./drawHelpers";

export default function SitesBar({ svgRef, node4Ref, siteRefs }) {
  const handleHover = (hovered) => {
    d3.select(svgRef.current)
      .selectAll("circle.node")
      .filter((d) => d.id === "Node 4")
      .attr("fill", hovered ? "#fde68a" : "#29c6e0")
      .attr("stroke", hovered ? "#facc15" : "#60a5fa")
      .attr("stroke-width", hovered ? 4 : 2);
  };

  return (
    <div className="absolute bottom-0 w-full px-4 py-4 flex flex-wrap justify-center gap-3 bg-slate-900 z-10">
      {Array.from({ length: 80 }).map((_, i) => (
        <button
          key={`btn-${i}`}
          ref={(el) => (siteRefs.current[i] = el)}
          onMouseEnter={(e) => {
            handleHover(true);
            const svg = d3.select(svgRef.current);
            const btnBox = e.currentTarget.getBoundingClientRect();
            const svgBox = svgRef.current.getBoundingClientRect();

            const btnX = btnBox.left + btnBox.width / 2 - svgBox.left;
            const btnY = btnBox.top + btnBox.height / 2 - svgBox.top;

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
              .attr("stroke", "#facc15")
              .attr("stroke-width", 3);
            e.currentTarget.style.backgroundColor = "#fde68a";
            e.currentTarget.style.borderColor = "#facc15";
          }}
          onMouseLeave={(e) => {
            handleHover(false);
            d3.select("#active-connector-line").remove();
            e.currentTarget.style.backgroundColor = "#29c6e0";
            e.currentTarget.style.borderColor = "#60a5fa";
          }}
          className="px-4 py-2 rounded text-white text-sm transition shadow"
          style={{
            backgroundColor: "#29c6e0",
            border: "2px solid #60a5fa",
          }}
        >
          site {i + 1}
        </button>
      ))}
    </div>
  );
}
