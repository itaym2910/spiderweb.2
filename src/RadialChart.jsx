import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

function RadialChart({ data }) {
  const ref = useRef();

  useEffect(() => {
    const width = 500;
    const height = 500;
    const innerRadius = 100;
    const outerRadius = 200;

    const svg = d3
      .select(ref.current)
      .attr("viewBox", [0, 0, width, height])
      .style("font", "10px sans-serif");

    svg.selectAll("*").remove(); // Clear previous content

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const angle = d3
      .scaleLinear()
      .domain([0, data.length])
      .range([0, 2 * Math.PI]);

    const radius = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range([innerRadius, outerRadius]);

    const line = d3
      .lineRadial()
      .angle((d, i) => angle(i))
      .radius((d) => radius(d.value));

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Dots
    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr(
        "transform",
        (d, i) =>
          `rotate(${(angle(i) * 180) / Math.PI - 90}) translate(${radius(
            d.value
          )},0)`
      )
      .attr("r", 2)
      .attr("fill", "black");

    // Labels
    g.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", (d, i) => {
        const a = angle(i) - Math.PI / 2;
        const r = outerRadius + 20;
        return `translate(${Math.cos(a) * r}, ${Math.sin(a) * r}) rotate(${
          (a * 180) / Math.PI
        })`;
      })
      .text((d) => d.label);
  }, [data]);

  return <svg ref={ref} width="100%" height="100%" />;
}

export default RadialChart;
