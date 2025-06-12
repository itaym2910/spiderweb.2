import * as d3 from "d3";

export function renderCoreDevices(
  zoomLayer,
  nodes,
  links,
  NODE_GROUPS,
  palette,
  onZoneClick
) {
  zoomLayer
    .append("g")
    .selectAll("g.zone-group")
    .data(NODE_GROUPS)
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
        .attr("fill-opacity", 0.12)
        .style("cursor", "pointer")
        .on("click", (_event, d_clicked_zone) => {
          console.log(
            "[renderCoreDevices] Zone clicked in D3. Zone data:",
            d_clicked_zone
          ); // LOG 1
          console.log(
            "[renderCoreDevices] Is onZoneClick prop available? Type:",
            typeof onZoneClick
          ); // LOG 2
          if (onZoneClick) {
            console.log(
              "[renderCoreDevices] Calling onZoneClick with ID:",
              d_clicked_zone.id
            ); // LOG 3
            onZoneClick(d_clicked_zone.id);
          } else {
            console.error(
              "[renderCoreDevices] onZoneClick is NOT defined here!"
            ); // LOG 4
          }
        });

      // Determine label offset
      const labelOffset = d.cy < screenCenterY ? -160 : 180;

      // Draw the zone label
      d3.select(this)
        .append("text")
        .attr("x", d.cx)
        .attr("y", d.cy + labelOffset)
        .text(d.id)
        .attr("fill", palette.label)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .style("pointer-events", "none");
    });

  const filteredLinks = links;
  const linkGroup = zoomLayer.append("g");

  const link = linkGroup
    .selectAll("line.visible-link")
    .data(filteredLinks)
    .join("line")
    .attr("class", "visible-link")
    .attr("stroke", palette.link)
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
    .attr("fill", palette.node) // Default fill
    .attr("stroke", palette.stroke)
    .attr("stroke-width", 2)
    .style("opacity", 0.9)
    .style("cursor", "pointer") // Add cursor pointer to nodes
    .on("mouseover", function () {
      const selection = d3.select(this);
      // Check if the node is NOT already highlighted yellow by link hover (from handleInteractions.js)
      // The hardcoded yellow color from handleInteractions is "#fde68a"
      if (selection.attr("fill") !== "#fde68a") {
        selection.attr("fill", palette.nodeHoverDirect); // Apply direct hover color
      }
    })
    .on("mouseout", function () {
      const selection = d3.select(this);
      // Only revert if it was our direct hover color.
      // If it's yellow, handleInteractions.js will manage reverting it.
      if (selection.attr("fill") === palette.nodeHoverDirect) {
        selection.attr("fill", palette.node); // Revert to default
      }
    })
    .on("click", function (event, d_node) {
      console.log("Node clicked:", d_node.id);
      event.stopPropagation(); // Prevent interference with other click handlers (e.g., zoom)
    });

  const label = zoomLayer
    .append("g")
    .selectAll("text.label")
    .data(nodes)
    .join("text")
    .attr("class", "label")
    .text((d) => d.id)
    .attr("fill", palette.label)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .style("pointer-events", "none")
    .style("cursor", "default");

  return { link, linkHover, node, label, filteredLinks };
}
