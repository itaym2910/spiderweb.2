import * as d3 from "d3";

export function renderCoreDevices(
  zoomLayer,
  nodes,
  links,
  CLUSTER_GROUPS,
  theme
) {
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
        .attr("fill", theme.zoneFill)
        .attr("fill-opacity", theme.zoneOpacity);

      // Determine label offset
      const labelOffset = d.cy < screenCenterY ? -160 : 180;

      // Draw the zone label
      d3.select(this)
        .append("text")
        .attr("x", d.cx)
        .attr("y", d.cy + labelOffset)
        .text(d.id)
        .attr("fill", theme.labelColor)
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
    .attr("stroke", theme.linkStroke)
    .attr("stroke-opacity", theme.linkOpacity)
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
    .attr("fill", theme.nodeFill)
    .attr("stroke", theme.nodeStroke)
    .attr("stroke-width", theme.nodeStrokeWidth)
    .style("opacity", 0.9);

  const label = zoomLayer
    .append("g")
    .selectAll("text.label")
    .data(nodes)
    .join("text")
    .attr("class", "label")
    .text((d) => d.id)
    .attr("fill", theme.labelColor)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .style("pointer-events", "none")
    .style("cursor", "default");

  return { link, linkHover, node, label, filteredLinks };
}
