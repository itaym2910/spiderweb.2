// src/renderCoreDevices.js
import * as d3 from "d3";

export function renderCoreDevices(
  zoomLayer,
  nodes,
  links,
  NODE_GROUPS,
  palette, // palette will be passed from NetworkVisualizer.js / NetworkVisualizer5.js
  onZoneClick,
  onNodeClick
) {
  // Define default zone fill and opacity (can be overridden by palette if provided)
  const defaultZoneFill = palette.zone?.fill || "#38bdf8";
  const defaultZoneOpacity = palette.zone?.opacity || 0.12;
  const hoverZoneFill = palette.zone?.hoverFill || defaultZoneFill; // Use same fill if not specified
  const hoverZoneOpacity =
    palette.zone?.hoverOpacity || defaultZoneOpacity + 0.15; // Slightly more opaque

  zoomLayer
    .append("g")
    .selectAll("g.zone-group")
    .data(NODE_GROUPS)
    .join("g")
    .attr("class", "zone-group")
    .each(function (d_zone_group_data) {
      // Renamed 'd' to be more specific
      const screenCenterY = window.innerHeight / 2;

      // Draw the zone circle
      d3.select(this)
        .append("circle")
        .attr("class", "zone")
        .attr("r", 150)
        .attr("cx", d_zone_group_data.cx)
        .attr("cy", d_zone_group_data.cy)
        .attr("fill", defaultZoneFill) // Use defaultZoneFill from palette or fallback
        .attr("fill-opacity", defaultZoneOpacity) // Use defaultZoneOpacity
        .style("cursor", "pointer")
        .on("click", (_event, d_clicked_zone) => {
          // d_clicked_zone is the datum of the CIRCLE, which is d_zone_group_data
          // console.log("[renderCoreDevices] Zone clicked in D3. Zone data:",d_clicked_zone);
          // console.log("[renderCoreDevices] Is onZoneClick prop available? Type:", typeof onZoneClick);
          if (onZoneClick) {
            // console.log("[renderCoreDevices] Calling onZoneClick with ID:", d_clicked_zone.id);
            onZoneClick(d_clicked_zone.id);
          } else {
            // console.error("[renderCoreDevices] onZoneClick is NOT defined here!");
          }
        })
        .on("mouseover", function () {
          // 'this' refers to the circle element
          d3.select(this)
            .transition()
            .duration(150) // Smooth transition
            .attr("fill", hoverZoneFill)
            .attr("fill-opacity", hoverZoneOpacity);
        })
        .on("mouseout", function () {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("fill", defaultZoneFill)
            .attr("fill-opacity", defaultZoneOpacity);
        });

      // Determine label offset
      const labelOffset = d_zone_group_data.cy < screenCenterY ? -160 : 180;

      // Draw the zone label
      d3.select(this)
        .append("text")
        .attr("x", d_zone_group_data.cx)
        .attr("y", d_zone_group_data.cy + labelOffset)
        .text(d_zone_group_data.id)
        .attr("fill", palette.label)
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .style("pointer-events", "none")
        .style("user-select", "none");
    });

  const filteredLinks = links;
  const linkGroup = zoomLayer.append("g");

  // ... (rest of the link, node, label rendering remains the same) ...
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
    .attr("fill", palette.node)
    .attr("stroke", palette.stroke)
    .attr("stroke-width", 2)
    .style("opacity", 0.9)
    .style("cursor", "pointer")
    .on("click", function (event, d_node) {
      // console.log("Node clicked:", d_node.id, "Zone:", d_node.zone);
      event.stopPropagation();
      if (onNodeClick) {
        onNodeClick(d_node); // d_node should have id and zone
      }
    });

  node
    .append("title")
    .text((d) => `Click to open ${d.shortName || d.id} links & interfaces`);

  const label = zoomLayer
    .append("g")
    .selectAll("text.label")
    .data(nodes)
    .join("text")
    .attr("class", "label")
    .text((d) => d.shortName || d.id)
    .attr("fill", palette.label)
    .attr("font-size", "18px")
    //.attr("font-weight", "bold") // Adds boldness
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .style("pointer-events", "none")
    .style("user-select", "none")
    .style("cursor", "default");

  const isDark = Boolean(palette?.isDark || palette?.bg === "#1f2937");
  const defaultBadgeBg = palette.badgeBg || (isDark ? "#0f172a" : "#ffffff");
  const defaultBadgeStroke = palette.badgeStroke || (isDark ? "#38bdf8" : "#2563eb");

  const nodeBadge = zoomLayer
    .append("g")
    .attr("class", "node-badges-group")
    .selectAll("g.node-badge")
    .data(nodes)
    .join("g")
    .attr("class", "node-badge")
    .attr("transform", (d) => `translate(${d.x + 42}, ${d.y - 42})`)
    .style("cursor", "pointer")
    .on("click", function (event, d_node) {
      event.stopPropagation();
      if (onNodeClick) {
        onNodeClick(d_node);
      }
    });

  nodeBadge
    .append("circle")
    .attr("class", "node-badge-circle")
    .attr("r", 13)
    .attr("fill", defaultBadgeBg)
    .attr("stroke", defaultBadgeStroke)
    .attr("stroke-width", 1.5)
    .style("opacity", 0.85);

  nodeBadge
    .append("path")
    .attr("class", "node-badge-icon")
    .attr("d", "M -3 3 L 3 -3 M -1 -3 L 3 -3 L 3 1")
    .attr("stroke", defaultBadgeStroke)
    .attr("stroke-width", 1.8)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("fill", "none")
    .style("pointer-events", "none");

  nodeBadge
    .append("title")
    .text((d) => `Click to open ${d.shortName || d.id} links & interfaces`);

  return { link, linkHover, node, nodeBadge, label, filteredLinks };
}
