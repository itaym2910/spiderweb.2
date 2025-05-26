import * as d3 from "d3";

export function renderClusters(zoomLayer, nodes, links, CLUSTER_GROUPS) {
  zoomLayer
    .append("g")
    .selectAll("g.zone-group")
    .data(CLUSTER_GROUPS)
    .join("g")
    .attr("class", "zone-group")
    .each(function (d) {
      const screenCenterY = window.innerHeight / 2;

      // Draw the zone circle
      d3.select(this)
        .append("circle")
        .attr("class", "zone")
        .attr("r", 150)
        .attr("cx", d.cx)
        .attr("cy", d.cy)
        .attr("fill", "#38bdf8")
        .attr("fill-opacity", 0.12);

      // Determine label offset
      const labelOffset = d.cy < screenCenterY ? -160 : 180;

      // Draw the zone label
      d3.select(this)
        .append("text")
        .attr("x", d.cx)
        .attr("y", d.cy + labelOffset)
        .text(d.id)
        .attr("fill", "#ffffff")
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold");
    });

  const filteredLinks = links; // ✅ include inner zone link

  const linkGroup = zoomLayer.append("g");

  const link = linkGroup
    .selectAll("line.visible-link")
    .data(filteredLinks)
    .join("line")
    .attr("class", "visible-link")
    .attr("stroke", "#94a3b8")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 2);

  const linkHover = linkGroup
    .selectAll("line.link-hover")
    .data(filteredLinks)
    .join("line")
    .attr("class", "link-hover")
    .attr("stroke", "transparent")
    .attr("stroke-width", 20)
    .style("cursor", "pointer");

  const node = zoomLayer
    .append("g")
    .selectAll("circle.node")
    .data(nodes)
    .join("circle")
    .attr("class", "node")
    .attr("r", 60)
    .attr("fill", "#29c6e0")
    .attr("stroke", "#60a5fa")
    .attr("stroke-width", 2)
    .style("opacity", 0.9);

  const label = zoomLayer
    .append("g")
    .selectAll("text.label")
    .data(nodes)
    .join("text")
    .attr("class", "label")
    .text((d) => d.id)
    .attr("fill", "#ffffff")
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .style("pointer-events", "none")
    .style("cursor", "default");

  return { link, linkHover, node, label, filteredLinks };
}
