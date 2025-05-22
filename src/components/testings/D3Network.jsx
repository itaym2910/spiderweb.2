import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const D3Network = () => {
  const svgRef = useRef();

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const zoneRadius = 100; // smaller zone circle
    const deviceCircleRadius = 60; // distance of core devices from zone center
    const zoneSpacingX = 300;
    const zoneSpacingY = 250;

    const zones = [];

    const nodes = [];
    const links = [];

    let nodeCounter = 1;

    // Create 6 zones in a 3x2 grid
    for (let i = 0; i < 6; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const centerX = 200 + col * zoneSpacingX;
      const centerY = 200 + row * zoneSpacingY;

      // Add zone background
      zones.push({ id: `zone-${i}`, cx: centerX, cy: centerY });

      // 4 core devices per zone
      for (let j = 0; j < 4; j++) {
        const angle = (j / 4) * 2 * Math.PI;
        const x = centerX + deviceCircleRadius * Math.cos(angle);
        const y = centerY + deviceCircleRadius * Math.sin(angle);
        const coreId = `C${i}-${j}`;
        nodes.push({ id: coreId, group: "coreDevice", x, y, fx: x, fy: y });

        // Add 1–2 sites per core device
        const siteCount = Math.random() > 0.5 ? 2 : 1;
        for (let k = 0; k < siteCount; k++) {
          const siteId = `S${nodeCounter++}`;
          nodes.push({ id: siteId, group: "site", parent: coreId });
          links.push({ source: coreId, target: siteId });
        }
      }
    }

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#f3f4f6");

    svg.selectAll("*").remove();

    const container = svg.append("g").attr("class", "zoom-container");

    // Enable zoom
    svg.call(
      d3
        .zoom()
        .scaleExtent([0.5, 4])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
        })
    );

    // Draw zone backgrounds
    container
      .append("g")
      .selectAll("circle")
      .data(zones)
      .join("circle")
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("r", zoneRadius)
      .attr("fill", "#e5e7eb"); // Tailwind gray-200

    // Add gradients
    const defs = svg.append("defs");

    const addGradient = (id, from, to) => {
      const grad = defs.append("radialGradient").attr("id", id);
      grad.append("stop").attr("offset", "0%").attr("stop-color", from);
      grad.append("stop").attr("offset", "100%").attr("stop-color", to);
    };

    addGradient("coreDeviceGrad", "#60a5fa", "#2563eb");
    addGradient("siteGrad", "#86efac", "#22c55e");

    // Draw links
    const link = container
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.5)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5);

    // Draw nodes
    const node = container
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => (d.group === "coreDevice" ? 20 : 12))
      .attr("fill", (d) =>
        d.group === "coreDevice" ? "url(#coreDeviceGrad)" : "url(#siteGrad)"
      )
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (d.group === "site") {
              d.fx = null;
              d.fy = null;
            }
          })
      );

    // Add labels
    const label = container
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d) => d.id)
      .attr("font-size", "11px")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("pointer-events", "none");

    // Force simulation (for sites only)
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(70)
      )
      .force("charge", d3.forceManyBody().strength(-80))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        label.attr("x", (d) => d.x).attr("y", (d) => d.y);
      });
  }, []);

  return <svg ref={svgRef} className="fixed top-0 left-0 w-screen h-screen" />;
};

export default D3Network;
