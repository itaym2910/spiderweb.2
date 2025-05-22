import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function OrionDashboard() {
  const svgRef = useRef();
  const [showGroups, setShowGroups] = useState(true);
  const [selectedSector, setSelectedSector] = useState(null);

  useEffect(() => {
    const width = 800;
    const height = 800;
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("font-family", "sans-serif");

    svg.selectAll("*").remove();

    const radius = Math.min(width, height) / 2 - 100;
    const center = { x: width / 2, y: height / 2 };

    const colors = d3.schemeTableau10;

    const data = Array.from({ length: 60 }, (_, i) => ({
      label: `Group ${Math.floor(i / 12) + 1} - Point ${i + 1}`,
      value: 20 + 20 * Math.sin(i / 4),
      index: i,
      group: Math.floor(i / 12),
    }));

    const angleScale = d3
      .scaleLinear()
      .domain([0, data.length])
      .range([0, 2 * Math.PI]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${center.x},${center.y})`);

    if (showGroups) {
      data.forEach((d, i) => {
        if (selectedSector !== null && d.group !== selectedSector) return;

        const angle = angleScale(i) - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const line = g
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", x)
          .attr("y2", y)
          .attr("stroke", "#ccc")
          .attr("stroke-width", 0.5);

        const pointGroup = g
          .append("g")
          .attr("transform", `translate(${x},${y})`)
          .style("cursor", "pointer");

        pointGroup
          .append("rect")
          .attr("transform", `rotate(${(angle * 180) / Math.PI})`)
          .on("mouseover", function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("transform", "scale(1.2)")
              .attr("fill", "#e91e63");

            line
              .transition()
              .duration(200)
              .attr("stroke", "#e91e63")
              .attr("stroke-width", 1.5);
          })
          .on("mouseout", function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("transform", "scale(1)")
              .attr("fill", colors[d.group % colors.length]);

            line
              .transition()
              .duration(200)
              .attr("stroke", "#ccc")
              .attr("stroke-width", 0.5);
          });

        pointGroup
          .append("text")
          .attr(
            "y",
            i % 4 === 0 ? -10 : i % 4 === 1 ? 0 : i % 4 === 2 ? 10 : 5
          );
      });
    }

    const sectors = [
      "Education",
      "Employment",
      "Health",
      "Finance",
      "Technology",
    ];
    sectors.forEach((label, i) => {
      const startAngle = (i / sectors.length) * 2 * Math.PI;
      const endAngle = ((i + 1) / sectors.length) * 2 * Math.PI;
      const angle = (startAngle + endAngle) / 2;
      const r = radius + 40;

      const x1 = Math.cos(startAngle - Math.PI / 2) * radius;
      const y1 = Math.sin(startAngle - Math.PI / 2) * radius;
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x1)
        .attr("y2", y1)
        .attr("stroke", "#888")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2");

      g.append("text")
        .attr("x", Math.cos(angle - Math.PI / 2) * r)
        .attr("y", Math.sin(angle - Math.PI / 2) * r)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("fill", selectedSector === i ? "red" : "#003399")
        .attr("font-weight", "bold")
        .style("cursor", "pointer")
        .text(label)
        .on("click", () =>
          setSelectedSector((prev) => (prev === i ? null : i))
        );
    });
  }, [showGroups, selectedSector]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2>Application Title</h2>
        <span>User Name</span>
      </div>
      <div style={{ display: "flex" }}>
        <div
          style={{
            width: "250px",
            marginRight: "2rem",
            background: "#fff",
            borderRadius: "12px",
            padding: "1rem",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <h4>Overlay Menu</h4>
          <details open>
            <summary style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
              Groups
            </summary>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showGroups}
                  onChange={() => setShowGroups((prev) => !prev)}
                  style={{ marginRight: "0.5rem" }}
                />
                Show Groups
              </label>
            </div>
          </details>
        </div>
        <div style={{ flex: 1 }}>
          <svg ref={svgRef} width={800} height={800} />
        </div>
      </div>
    </div>
  );
}
