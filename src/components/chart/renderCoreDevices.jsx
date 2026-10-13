// src/renderCoreDevices.js
import * as d3 from "d3";
import { normalizeLinkStatus } from "./drawHelpers";

export function renderCoreDevices(
  zoomLayer,
  nodes,
  links,
  NODE_GROUPS,
  palette,
  onZoneClick,
  onNodeClick,
  trafficByZone = {},
  zoneRanks = {}
) {
  // Helper function to convert bits to GB and format for display
  const formatTrafficValue = (bits) => {
    // Handle null, undefined, or non-numeric values
    if (bits === undefined || bits === null || bits === "") {
      return "N/A";
    }

    const numBits = parseFloat(bits);
    if (isNaN(numBits)) {
      return "N/A";
    }

    // Convert bits to GB (using decimal/SI: 1 GB = 1,000,000,000 bits)
    const gb = numBits / 1_000_000_000;

    // Format based on magnitude
    if (gb >= 100) {
      return `${Math.round(gb)} GB`;
    } else if (gb >= 10) {
      return `${gb.toFixed(1)} GB`;
    } else if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    } else if (gb >= 0.01) {
      // Show in MB for smaller values
      const mb = numBits / 1_000_000;
      return `${mb.toFixed(1)} MB`;
    } else if (gb >= 0.00001) {
      // Show in KB for very small values
      const kb = numBits / 1_000;
      return `${kb.toFixed(1)} KB`;
    } else {
      return `${numBits} b`;
    }
  };

  // Define default zone fill and opacity (can be overridden by palette if provided)
  const defaultZoneFill = palette.zone?.fill || "#38bdf8";
  const defaultZoneOpacity = palette.zone?.opacity || 0.12;
  const hoverZoneFill = palette.zone?.hoverFill || defaultZoneFill;
  const hoverZoneOpacity =
    palette.zone?.hoverOpacity || defaultZoneOpacity + 0.15;

  // ----------------------------------------------------------------
  // Render Zone Groups
  // ----------------------------------------------------------------
  zoomLayer
    .append("g")
    .selectAll("g.zone-group")
    .data(NODE_GROUPS)
    .join("g")
    .attr("class", "zone-group")
    .each(function (d_zone_group_data) {
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

        // Format traffic values in GB
        const trafficInGB = formatTrafficValue(zoneTraffic.traffic.in);
        const trafficOutGB = formatTrafficValue(zoneTraffic.traffic.out);

        // Inbound traffic (emerald)
        textNode
          .append("tspan")
          .attr("fill", isDarkTheme ? "#34d399" : "#059669")
          .text(`↓ ${trafficInGB}`);

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
          .text(`↑ ${trafficOutGB}`);
      }
    });

  // ----------------------------------------------------------------
  // Render Links
  // ----------------------------------------------------------------
  const filteredLinks = links;
  const linkGroup = zoomLayer.append("g");

  const link = linkGroup
    .selectAll("line.visible-link")
    .data(filteredLinks)
    .join("line")
    .attr("class", "visible-link")
    .attr("stroke", (d) => {
      const s = normalizeLinkStatus(d);
      if (s === "down") return palette?.status?.down || "#ef4444";
      if (s === "issue") return palette?.status?.issue || "#f59e0b";
      return palette.link;
    })
    .attr("stroke-opacity", (d) => {
      const s = normalizeLinkStatus(d);
      return s === "down" || s === "issue" ? 1.0 : 0.6;
    })
    .attr("stroke-width", (d) => {
      const s = normalizeLinkStatus(d);
      return s === "down" ? 3 : s === "issue" ? 2.5 : 2;
    })
    .attr("vector-effect", "non-scaling-stroke");

  const linkHover = linkGroup
    .selectAll("line.link-hover")
    .data(filteredLinks)
    .join("line")
    .attr("class", "link-hover")
    .attr("stroke", "transparent")
    .attr("stroke-width", 20)
    .style("cursor", "pointer");

  // ----------------------------------------------------------------
  // Render Nodes
  // ----------------------------------------------------------------
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
      event.stopPropagation();
      if (onNodeClick) {
        onNodeClick(d_node);
      }
    });

  node
    .append("title")
    .text((d) => `Click to open ${d.shortName || d.id} links & interfaces`);

  // ----------------------------------------------------------------
  // Render Labels
  // ----------------------------------------------------------------
  const label = zoomLayer
    .append("g")
    .selectAll("text.label")
    .data(nodes)
    .join("text")
    .attr("class", "label")
    .text((d) => d.shortName || d.id)
    .attr("fill", palette.label)
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .style("pointer-events", "none")
    .style("user-select", "none")
    .style("cursor", "default");

  return { link, linkHover, node, label, filteredLinks };
}

// ----------------------------------------------------------------
// Helper function to calculate zone ranks
// ----------------------------------------------------------------
export function calculateZoneRanks(trafficByZone) {
  const sortedZones = Object.entries(trafficByZone)
    .map(([id, data]) => ({
      id,
      total:
        (parseFloat(data?.traffic?.in) || 0) +
        (parseFloat(data?.traffic?.out) || 0)
    }))
    .filter((z) => z.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((z, i) => ({ ...z, rank: i + 1 }));

  return Object.fromEntries(sortedZones.map((z) => [z.id, z.rank]));
}
