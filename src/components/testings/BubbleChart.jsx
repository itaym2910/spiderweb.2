import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BubbleChart = () => {
  const svgRef = useRef();

  useEffect(() => {
    const data = [
      { name: "Low commission", value: 60, group: "positive" },
      { name: "Resolve issue", value: 35, group: "positive" },
      { name: "Leave review", value: 32, group: "positive" },
      { name: "Travel insurance", value: 50, group: "negative" },
      { name: "Shipping price", value: 40, group: "negative" },
      { name: "Coupon code", value: 35, group: "negative" },
      { name: "Charge fee", value: 25, group: "neutral" },
      { name: "Use app", value: 22, group: "neutral" },
      { name: "Link account", value: 20, group: "neutral" },
      { name: "Speak german", value: 15, group: "neutral" },
    ];

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const colorScale = d3
      .scaleOrdinal()
      .domain(["positive", "negative", "neutral"])
      .range(["url(#greenGrad)", "url(#redGrad)", "url(#blueGrad)"]);

    const defs = svg.append("defs");

    const makeGradient = (id, from, to) => {
      const grad = defs.append("radialGradient").attr("id", id);
      grad.append("stop").attr("offset", "0%").attr("stop-color", from);
      grad.append("stop").attr("offset", "100%").attr("stop-color", to);
    };

    makeGradient("greenGrad", "rgb(120, 215, 135)", "rgb(88, 190, 99)");
    makeGradient("redGrad", "rgb(240, 130, 140)", "rgb(200, 85, 110)");
    makeGradient("blueGrad", "rgb(200, 210, 240)", "rgb(175, 185, 223)");

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("r", (d) => d.value)
      .attr("fill", (d) => colorScale(d.group))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.05))");

    const label = svg
      .append("g")
      .selectAll("text")
      .data(data)
      .join("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#fff")
      .style("pointer-events", "none");

    d3.forceSimulation(data)
      .force("charge", d3.forceManyBody().strength(5))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => d.value + 2)
      )
      .on("tick", () => {
        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        label.attr("x", (d) => d.x).attr("y", (d) => d.y);
      });
  }, []);

  return <svg ref={svgRef} className="fixed top-0 left-0 w-screen h-screen" />;
};

export default BubbleChart;
