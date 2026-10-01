// src/renderCoreDevices.js
import * as d3 from "d3";

export function renderCoreDevices(
  zoomLayer,
  nodes,
  links,
  NODE_GROUPS,
  palette, // palette will be passed from NetworkVisualizer.js / NetworkVisualizer5.js
  onZoneClick,
  onNodeClick,
  trafficByZone = {}
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

      const isDarkTheme = palette.bg !== "#f8fafc" && palette.bg !== "#ffffff";
      const isTopZone = d_zone_group_data.cy < screenCenterY;

      // Resolve live traffic for this zone
      const zoneTraffic =
        trafficByZone[d_zone_group_data.id] ||
        trafficByZone[d_zone_group_data.id?.toLowerCase()] ||
        Object.values(trafficByZone).find(
          (t) =>
            t &&
            (t.name === d_zone_group_data.id ||
              t.core_site_name === d_zone_group_data.id)
        );

      const isValidTrafficRate = (val) => {
        if (val === undefined || val === null) return false;
        const str = String(val).trim();
        return (
          str !== "" &&
          str !== "N/A" &&
          str !== "--" &&
          str !== "null" &&
          str !== "undefined" &&
          !str.includes("undefined") &&
          !str.includes("null")
        );
      };

      const hasTraffic = Boolean(
        zoneTraffic &&
        zoneTraffic.traffic &&
        !zoneTraffic.error &&
        isValidTrafficRate(zoneTraffic.traffic.in) &&
        isValidTrafficRate(zoneTraffic.traffic.out)
      );

      // Sizing and positioning:
      // When traffic is present, use standard 184px width for the 2-line layout.
      // When traffic is unavailable, collapse gracefully to a sleek single-line pill sized to the site name.
      const nameLength = (d_zone_group_data.id || "").length;
      const cardWidth = hasTraffic
        ? 184
        : Math.max(124, Math.min(168, nameLength * 8.5 + 32));
      const cardHeight = hasTraffic ? 46 : 30;
      const cardRadius = hasTraffic ? 12 : 10;
      const cardX = d_zone_group_data.cx - cardWidth / 2;
      const cardY = isTopZone
        ? d_zone_group_data.cy - 150 - cardHeight - 8
        : d_zone_group_data.cy + 150 + 8;

      // Group for the unified zone header capsule
      const headerGroup = d3
        .select(this)
        .append("g")
        .attr("class", "zone-header-capsule")
        .style("cursor", "pointer");

      // Capsule background
      const cardRect = headerGroup
        .append("rect")
        .attr("x", cardX)
        .attr("y", cardY)
        .attr("width", cardWidth)
        .attr("height", cardHeight)
        .attr("rx", cardRadius)
        .attr("ry", cardRadius)
        .attr(
          "fill",
          isDarkTheme ? "rgba(15, 23, 42, 0.88)" : "rgba(255, 255, 255, 0.95)"
        )
        .attr(
          "stroke",
          isDarkTheme ? "rgba(56, 189, 248, 0.35)" : "rgba(186, 230, 253, 0.9)"
        )
        .attr("stroke-width", 1.2)
        .style("transition", "all 0.18s ease-in-out");

      // Draw the zone circle
      const circleSelection = d3
        .select(this)
        .append("circle")
        .attr("class", "zone")
        .attr("r", 150)
        .attr("cx", d_zone_group_data.cx)
        .attr("cy", d_zone_group_data.cy)
        .attr("fill", defaultZoneFill)
        .attr("fill-opacity", defaultZoneOpacity)
        .style("cursor", "pointer");

      // Synchronized click interaction
      const handleZoneNavigate = () => {
        if (onZoneClick) {
          onZoneClick(d_zone_group_data.id);
        }
      };

      circleSelection.on("click", handleZoneNavigate);
      headerGroup.on("click", handleZoneNavigate);

      // Synchronized hover interaction
      const setHoverState = (hovered) => {
        circleSelection
          .transition()
          .duration(150)
          .attr("fill", hovered ? hoverZoneFill : defaultZoneFill)
          .attr("fill-opacity", hovered ? hoverZoneOpacity : defaultZoneOpacity);

        cardRect
          .attr(
            "stroke",
            hovered
              ? isDarkTheme
                ? "rgba(56, 189, 248, 0.95)"
                : "rgba(2, 132, 199, 0.95)"
              : isDarkTheme
              ? "rgba(56, 189, 248, 0.35)"
              : "rgba(186, 230, 253, 0.9)"
          )
          .attr("stroke-width", hovered ? 1.8 : 1.2)
          .attr(
            "fill",
            hovered
              ? isDarkTheme
                ? "rgba(30, 41, 59, 0.95)"
                : "rgba(240, 249, 255, 0.98)"
              : isDarkTheme
              ? "rgba(15, 23, 42, 0.88)"
              : "rgba(255, 255, 255, 0.95)"
          );
      };

      circleSelection
        .on("mouseover", () => setHoverState(true))
        .on("mouseout", () => setHoverState(false));

      headerGroup
        .on("mouseover", () => setHoverState(true))
        .on("mouseout", () => setHoverState(false));

      // Zone Name (Title) - always on top inside the capsule
      const titleY = hasTraffic ? cardY + 18 : cardY + cardHeight / 2 + 4;
      headerGroup
        .append("text")
        .attr("x", d_zone_group_data.cx)
        .attr("y", titleY)
        .text(d_zone_group_data.id)
        .attr("fill", isDarkTheme ? "#f8fafc" : "#0f172a")
        .attr("font-size", "13.5px")
        .attr("font-family", "system-ui, -apple-system, sans-serif")
        .attr("font-weight", "700")
        .attr("letter-spacing", "0.02em")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .style("user-select", "none");

      // Live Traffic Row (Subtitle) - always below the title inside the capsule
      if (hasTraffic) {
        const trafficY = cardY + 34;
        const textNode = headerGroup
          .append("text")
          .attr("x", d_zone_group_data.cx)
          .attr("y", trafficY)
          .attr("text-anchor", "middle")
          .attr("font-size", "11px")
          .attr("font-family", "system-ui, -apple-system, sans-serif")
          .attr("font-weight", "600")
          .style("pointer-events", "none")
          .style("user-select", "none");

        // Inbound traffic (emerald)
        textNode
          .append("tspan")
          .attr("fill", isDarkTheme ? "#34d399" : "#059669")
          .text(`↓ ${zoneTraffic.traffic.in}`);

        // Subtle bullet separator
        textNode
          .append("tspan")
          .attr("fill", isDarkTheme ? "#64748b" : "#94a3b8")
          .attr("font-weight", "400")
          .text("   •   ");

        // Outbound traffic (amber)
        textNode
          .append("tspan")
          .attr("fill", isDarkTheme ? "#fbbf24" : "#d97706")
          .text(`↑ ${zoneTraffic.traffic.out}`);
      }
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

  return { link, linkHover, node, label, filteredLinks };
}
