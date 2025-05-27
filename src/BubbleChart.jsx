import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const colorMap = {
  positive: "#4caf50",
  negative: "#f44336",
  neutral: "#2196f3",
};

export default function BubbleChart() {
  const ref = useRef();

  useEffect(() => {
    d3.json("/bubble_chart_data.json").then((data) => {
      const width = 600;
      const height = 600;

      const svg = d3
        .select(ref.current)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("font-family", "sans-serif");

      svg.selectAll("*").remove(); // Clear previous

      const root = d3.hierarchy(data).sum((d) => d.value);

      const pack = d3.pack().size([width, height]).padding(6);

      const nodes = pack(root).leaves();

      const g = svg.append("g");

      const node = g
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      node
        .append("circle")
        .attr("r", (d) => d.r)
        .attr("fill", (d) => colorMap[d.data.sentiment])
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .on("mouseover", function (event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", d.r * 1.2)
            .attr("fill", "gold");
        })
        .on("mouseout", function (event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", d.r)
            .attr("fill", colorMap[d.data.sentiment]);
        });

      node
        .append("text")
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .style("pointer-events", "none")
        .style("fill", "#fff")
        .text((d) => d.data.name)
        .attr("dy", ".3em");
    });
  }, []);

  return <svg ref={ref} width="100%" height="100%" />;
}
