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
  // =========================================================
  // Helper: Calculate traffic intensity (0-1 normalized score)
  // =========================================================
  const calculateTrafficIntensity = (zoneTraffic) => {
    if (!zoneTraffic?.traffic) return 0;

    const inVal = parseFloat(zoneTraffic.traffic.in) || 0;
    const outVal = parseFloat(zoneTraffic.traffic.out) || 0;
    const total = inVal + outVal;

    return Math.min(1, total / 10_000_000_000);
  };

  // =========================================================
  // Helper: Convert bits to GB/MB/KB and format for display
  // =========================================================
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

  // Define default zone fill and opacity
  const defaultZoneFill = palette.zone?.fill || "#38bdf8";
  const defaultZoneOpacity = palette.zone?.opacity || 0.12;
  const hoverZoneFill = palette.zone?.hoverFill || defaultZoneFill;
  const hoverZoneOpacity =
    palette.zone?.hoverOpacity || defaultZoneOpacity + 0.15;

  // Rank badge colors
  const rankColors = {
    1: "#ffbf24",
    2: "#94a3b8",
    3: "#cd7f32"
  };

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

      // Get zone rank (1 = highest traffic)
      const zoneRank = zoneRanks[d_zone_group_data.id] || 0;

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

      // Calculate traffic intensity for visual modifications
      const trafficIntensity = calculateTrafficIntensity(zoneTraffic);
      const isHighTraffic = trafficIntensity > 0.5;

      // Sizing and positioning
      const nameLength = (d_zone_group_data.id || "").length;
      const cardWidth = hasTraffic
        ? 180
        : Math.max(124, Math.min(168, nameLength * 8.5 + 32));
      const cardHeight = hasTraffic ? 50 : 30;
      const cardRadius = hasTraffic ? 12 : 10;
      const cardX = d_zone_group_data.cx - cardWidth / 2;
      const cardY = isTopZone
        ? d_zone_group_data.cy - 140 - cardHeight - 6
        : d_zone_group_data.cy + 140 + 6;

      // Zone name label dimensions
      const zoneNameY = isTopZone
        ? d_zone_group_data.cy - 140 - cardHeight - 22
        : d_zone_group_data.cy + 140 + cardHeight + 22;
      const zoneNameFontSize = 16;

      // Group for the unified zone header capsule
      const headerGroup = d3
        .select(this)
        .append("g")
        .attr("class", "zone-header-capsule")
        .style("cursor", "pointer");

      // Capsule background - thicker border for high traffic zones
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
          isDarkTheme ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.97)"
        )
        .attr(
          "stroke",
          isHighTraffic
            ? isDarkTheme
              ? "rgba(34, 197, 94, 0.8)"
              : "rgba(22, 163, 74, 0.8)"
            : isDarkTheme
              ? "rgba(56, 189, 248, 0.35)"
              : "rgba(186, 230, 253, 0.9)"
        )
        .attr("stroke-width", isHighTraffic ? 2.5 : 1.2)
        .style("transition", "all 0.18s ease-in-out")
        .style(
          "filter",
          isHighTraffic
            ? "drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))"
            : "none"
        );

      // Draw the zone circle
      const circleRadius = 150 + trafficIntensity * 50;

      const circleSelection = d3
        .select(this)
        .append("circle")
        .attr("class", "zone")
        .attr("r", circleRadius)
        .attr("cx", d_zone_group_data.cx)
        .attr("cy", d_zone_group_data.cy)
        .attr("fill", defaultZoneFill)
        .attr("fill-opacity", defaultZoneOpacity)
        .style("cursor", "pointer")
        .style("transition", "all 0.15s ease-in-out");

      // Synchronized click interaction
      const handleZoneNavigate = () => {
        if (onZoneClick) {
          onZoneClick(d_zone_group_data.id);
        }
      };

      circleSelection.on("click", handleZoneNavigate);
      headerGroup.on("click", handleZoneNavigate);

      // ----------------------------------------------------------------
      // Zone Name (Title) - BIGGER and SEPARATED
      // ----------------------------------------------------------------
      const zonePrefix =
        zoneRank === 1 ? "🥇 " : zoneRank === 2 ? "🥈 " : zoneRank === 3 ? "🥉 " : "";
      const zoneNameText = zonePrefix + d_zone_group_data.id;

      headerGroup
        .append("text")
        .attr("x", d_zone_group_data.cx)
        .attr("y", zoneNameY)
        .attr("text-anchor", "middle")
        .attr("font-size", `${zoneNameFontSize}px`)
        .attr("font-family", "system-ui, -apple-system, sans-serif")
        .attr("font-weight", "800")
        .attr("fill", isDarkTheme ? "#f1f5f9" : "#0f172a")
        .attr("letter-spacing", "0.03em")
        .style("pointer-events", "none")
        .style("user-select", "none")
        .style(
          "filter",
          isDarkTheme
            ? "drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
            : "drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
        )
        .text(zoneNameText);

      // ----------------------------------------------------------------
      // Live Traffic - in separate card below
      // ----------------------------------------------------------------
      if (hasTraffic) {
        const trafficInGB = formatTrafficValue(zoneTraffic.traffic.in);
        const trafficOutGB = formatTrafficValue(zoneTraffic.traffic.out);

        const inBits = parseFloat(zoneTraffic.traffic.in) || 0;
        const outBits = parseFloat(zoneTraffic.traffic.out) || 0;
        const totalTrafficGB = formatTrafficValue(inBits + outBits);

        const trafficY = cardY + cardHeight / 2 + 4;
        const trafficX = d_zone_group_data.cx;

        const textColor = isDarkTheme ? "#94a3b8" : "#64748b";
        const valueColor = isDarkTheme ? "#f8fafc" : "#0f172a";

        const trafficGroup = headerGroup
          .append("g")
          .style("pointer-events", "none");

        // Total on top
        trafficGroup
          .append("text")
          .attr("x", trafficX)
          .attr("y", trafficY - 8)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "700")
          .attr("fill", valueColor)
          .text(totalTrafficGB);

        // IN and OUT below
        trafficGroup
          .append("text")
          .attr("x", trafficX - 22)
          .attr("y", trafficY + 6)
          .attr("text-anchor", "end")
          .attr("font-size", "10px")
          .attr("font-weight", "500")
          .attr("fill", textColor)
          .text(`↓ ${trafficInGB}`);

        trafficGroup
          .append("text")
          .attr("x", trafficX + 22)
          .attr("y", trafficY + 6)
          .attr("text-anchor", "start")
          .attr("font-size", "10px")
          .attr("font-weight", "500")
          .attr("fill", textColor)
          .text(`↑ ${trafficOutGB}`);
      }

      // ----------------------------------------------------------------
      // Rank Badge for Top 3 Traffic Zones
      // ----------------------------------------------------------------
      if (hasTraffic && zoneRank >= 1 && zoneRank <= 3) {
        const rankColor = rankColors[zoneRank];

        headerGroup
          .append("circle")
          .attr("cx", cardX + cardWidth - 16)
          .attr("cy", cardY + 12)
          .attr("r", 11)
          .attr("fill", rankColor)
          .attr("stroke", isDarkTheme ? "#0f172a" : "#ffffff")
          .attr("stroke-width", 2);

        const medalEmojis = { 1: "🥇", 2: "🥈", 3: "🥉" };

        headerGroup
          .append("text")
          .attr("x", cardX + cardWidth - 16)
          .attr("y", cardY + 16)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .text(medalEmojis[zoneRank]);
      }

      // Synchronized hover interaction
      const setHoverState = (hovered) => {
        circleSelection
          .transition()
          .duration(150)
          .attr("fill", hovered ? hoverZoneFill : defaultZoneFill)
          .attr(
            "fill-opacity",
            hovered ? hoverZoneOpacity : defaultZoneOpacity
          );

        cardRect
          .transition()
          .duration(150)
          .attr("stroke-width", hovered ? 2.5 : isHighTraffic ? 2.5 : 1.2)
          .attr(
            "stroke",
            hovered
              ? isDarkTheme
                ? "rgba(56, 189, 248, 1)"
                : "rgba(2, 132, 199, 1)"
              : isHighTraffic
                ? isDarkTheme
                  ? "rgba(34, 197, 94, 0.8)"
                  : "rgba(22, 163, 74, 0.8)"
                : isDarkTheme
                  ? "rgba(56, 189, 248, 0.35)"
                  : "rgba(186, 230, 253, 0.9)"
          )
          .attr(
            "fill",
            hovered
              ? isDarkTheme
                ? "rgba(30, 41, 59, 0.98)"
                : "rgba(240, 249, 255, 0.99)"
              : isDarkTheme
                ? "rgba(15, 23, 42, 0.92)"
                : "rgba(255, 255, 255, 0.97)"
          );
      };

      headerGroup
        .on("mouseover", () => setHoverState(true))
        .on("mouseout", () => setHoverState(false));
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
