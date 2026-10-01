/**
 * Parses a ratio string like "5/5", "4/5", "99/100", "8000/10000", "8000 / 10000 packets".
 * Returns { success: number, total: number, rate: number } or null.
 */
export function parseRatioString(val) {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  const match = str.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const success = Number(match[1]);
  const total = Number(match[2]);
  if (isNaN(success) || isNaN(total) || total <= 0) return null;
  const lost = Math.max(0, total - success);
  // Even one lost packet is a problem: rate must never round up to 100% if lost > 0!
  let rate;
  if (lost === 0) {
    rate = 100;
  } else {
    const rawRate = (success / total) * 100;
    rate = Math.min(99.9, Math.round(rawRate * 10) / 10);
  }
  return { success, total, rate, lost };
}

/**
 * Extracts, normalizes, and calculates ping metrics from an object or individual arguments.
 * Dynamically supports arbitrary probe sizes (5, 100, 10000) and ratio formats ("8000/10000", "99/100", "4/5").
 */
export function extractPingMetrics(itemOrRate, packetsSuccess, packetsTotal, ratioString) {
  let rateRaw = null;
  let successRaw = packetsSuccess;
  let totalRaw = packetsTotal;
  let ratioRaw = ratioString;

  if (itemOrRate !== null && typeof itemOrRate === "object") {
    const obj = itemOrRate;
    const raw = obj.rawLink || obj.raw || obj.additionalDetails || {};

    // Ratio string candidates
    ratioRaw =
      ratioRaw ??
      obj.ping_ratio ??
      raw.ping_ratio ??
      obj.packet_ratio ??
      raw.packet_ratio ??
      obj.ping_packets_ratio ??
      raw.ping_packets_ratio ??
      obj.ratio ??
      raw.ratio ??
      (typeof obj.ping_success_attempts === "string" && obj.ping_success_attempts.includes("/") ? obj.ping_success_attempts : null) ??
      (typeof raw.ping_success_attempts === "string" && raw.ping_success_attempts.includes("/") ? raw.ping_success_attempts : null) ??
      (typeof obj.ping_packets === "string" && obj.ping_packets.includes("/") ? obj.ping_packets : null) ??
      (typeof obj.packets === "string" && obj.packets.includes("/") ? obj.packets : null) ??
      (typeof obj.pings === "string" && obj.pings.includes("/") ? obj.pings : null);

    // Total pings candidates
    totalRaw =
      totalRaw ??
      obj.ping_packets_total ??
      raw.ping_packets_total ??
      obj.ping_total ??
      raw.ping_total ??
      obj.total_pings ??
      raw.total_pings ??
      obj.packets_total ??
      raw.packets_total ??
      obj.total_packets ??
      raw.total_packets ??
      obj.total_amount_of_pings ??
      raw.total_amount_of_pings ??
      obj.pings_made ??
      raw.pings_made ??
      obj.pingPacketsTotal ??
      raw.pingPacketsTotal;

    // Packets success candidates
    successRaw =
      successRaw ??
      obj.ping_success_attempts ??
      raw.ping_success_attempts ??
      obj.ping_packets_success ??
      raw.ping_packets_success ??
      obj.packets_success ??
      raw.packets_success ??
      obj.ping_success ??
      raw.ping_success ??
      obj.successful_pings ??
      raw.successful_pings ??
      obj.success_pings ??
      raw.success_pings ??
      obj.pingPacketsSuccess ??
      raw.pingPacketsSuccess;

    // Rate candidates
    rateRaw =
      obj.ping_success_rate ??
      raw.ping_success_rate ??
      obj.ping_rate ??
      raw.ping_rate ??
      obj.pingSuccessRate ??
      raw.pingSuccessRate ??
      obj.ping ??
      raw.ping ??
      obj.pingRate ??
      raw.pingRate ??
      obj.success_rate ??
      raw.success_rate ??
      obj.rate ??
      raw.rate ??
      obj.numRate;
  } else {
    rateRaw = itemOrRate;
  }

  // 1. Try parsing ratio string if present
  let parsedFromRatio = null;
  if (ratioRaw) {
    parsedFromRatio = parseRatioString(ratioRaw);
  }

  let success = null;
  let total = null;
  let numRate = null;

  if (rateRaw !== undefined && rateRaw !== null && rateRaw !== "") {
    const parsedRate = Number(String(rateRaw).replace("%", "").trim());
    if (!isNaN(parsedRate)) {
      numRate = parsedRate;
    }
  }

  if (parsedFromRatio) {
    success = parsedFromRatio.success;
    total = parsedFromRatio.total;
    if (numRate === null) {
      numRate = parsedFromRatio.rate;
    }
  } else {
    const parsedTotal = totalRaw != null ? Number(totalRaw) : null;
    const parsedSuccess = successRaw != null ? Number(successRaw) : null;

    if (parsedTotal != null && !isNaN(parsedTotal) && parsedTotal > 0) {
      total = parsedTotal;
      if (parsedSuccess != null && !isNaN(parsedSuccess)) {
        success = parsedSuccess;
        if (numRate === null) {
          const rawRate = (success / total) * 100;
          numRate = success < total ? Math.min(99.9, Math.round(rawRate * 10) / 10) : 100;
        }
      } else if (numRate !== null) {
        success = Math.round((numRate / 100) * total);
      }
    } else if (parsedSuccess != null && !isNaN(parsedSuccess)) {
      success = parsedSuccess;
      if (numRate !== null && numRate > 0) {
        total = Math.max(success, Math.round((success / numRate) * 100));
      } else {
        total = Math.max(10000, success);
      }
    } else if (numRate !== null) {
      // Default total is 10000 when backend only sends the rate
      total = 10000;
      success = Math.round((numRate / 100) * total);
    }
  }

  if (numRate === null && (success === null || total === null)) {
    return null;
  }

  if (numRate === null && success !== null && total !== null && total > 0) {
    const rawRate = (success / total) * 100;
    numRate = success < total ? Math.min(99.9, Math.round(rawRate * 10) / 10) : 100;
  }

  // Calculate packet loss accurately: even one lost packet is a problem!
  const lost = (total != null && success != null)
    ? Math.max(0, total - success)
    : (numRate != null && numRate < 100 ? 1 : 0);
  const hasPacketLoss = lost > 0 || (numRate != null && numRate < 100);

  // If there is even one lost packet, rate must NEVER round up to 100%
  let roundedRate;
  if (hasPacketLoss) {
    if (numRate === 0 || success === 0) {
      roundedRate = 0;
    } else {
      roundedRate = Math.min(99.9, Math.max(0.1, Math.round(numRate * 10) / 10));
    }
  } else {
    roundedRate = 100;
  }

  const pctStr = `${roundedRate}%`;
  const ratioStr = `${success}/${total} packets`;
  const shortRatioStr = `${success}/${total}`;

  return {
    percentage: pctStr,
    ratio: ratioStr,
    shortRatio: shortRatioStr,
    full: `${pctStr} (${ratioStr})`,
    short: `${pctStr} (${shortRatioStr})`,
    packetsSuccess: success,
    packetsTotal: total,
    packetsLost: lost,
    hasPacketLoss,
    rate: roundedRate,
  };
}

/**
 * Helper to calculate and format ping success rate and packet ratio (e.g. "80% (4/5 packets)", "80% (8000/10000)").
 * Accepts either:
 * - formatPingRateWithPackets(linkOrObject)
 * - formatPingRateWithPackets(rate, packetsSuccess, packetsTotal, ratioString)
 */
export function formatPingRateWithPackets(rateOrObj, packetsSuccess, packetsTotal, ratioString) {
  return extractPingMetrics(rateOrObj, packetsSuccess, packetsTotal, ratioString);
}

/**
 * Calculates aggregate ping telemetry summary across an array of links.
 */
export function calculatePingSummary(links) {
  if (!Array.isArray(links) || links.length === 0) {
    return {
      totalLinks: 0,
      monitoredCount: 0,
      totalPacketsSuccess: 0,
      totalPacketsTotal: 0,
      totalPacketsLost: 0,
      overallSuccessRate: 0,
      overallLossRate: 0,
      formattedRate: "0%",
      formattedLossRate: "0%",
      formattedPackets: "0/0",
      healthyCount: 0,
      degradedCount: 0,
      downCount: 0,
      unmonitoredCount: 0,
      healthyPercent: 0,
      degradedPercent: 0,
      downPercent: 0,
      statusCategory: "down",
      problemLinks: [],
      healthyLinks: [],
    };
  }

  let totalPacketsSuccess = 0;
  let totalPacketsTotal = 0;
  let healthyCount = 0;
  let degradedCount = 0;
  let downCount = 0;
  let unmonitoredCount = 0;
  const problemLinks = [];
  const healthyLinks = [];

  links.forEach((l) => {
    const info = formatPingRateWithPackets(l);

    if (!info) {
      unmonitoredCount++;
      return;
    }

    const s = info.packetsSuccess ?? 0;
    const t = info.packetsTotal ?? 0;
    const numRate = info.rate ?? 0;
    const lost = info.packetsLost ?? Math.max(0, t - s);
    const hasLoss = info.hasPacketLoss || lost > 0 || numRate < 100;

    totalPacketsSuccess += s;
    totalPacketsTotal += t;

    const enriched = { ...l, pingInfo: info, numRate, packetsLost: lost, hasPacketLoss: hasLoss };

    // Even one lost packet is a problem: a link is healthy ONLY if zero lost packets AND 100% rate
    if (!hasLoss && numRate >= 100) {
      healthyCount++;
      healthyLinks.push(enriched);
    } else if (numRate > 0 && s > 0) {
      degradedCount++;
      problemLinks.push(enriched);
    } else {
      downCount++;
      problemLinks.push(enriched);
    }
  });

  const monitoredCount = healthyCount + degradedCount + downCount;
  const totalLost = Math.max(0, totalPacketsTotal - totalPacketsSuccess);

  // If even one packet was lost across the entire network, overallSuccessRate must NEVER round to 100%!
  let overallSuccessRate = 0;
  if (totalPacketsTotal > 0) {
    if (totalLost === 0) {
      overallSuccessRate = 100;
    } else {
      const rawRate = (totalPacketsSuccess / totalPacketsTotal) * 100;
      overallSuccessRate = Math.min(99.9, Math.round(rawRate * 10) / 10);
    }
  }

  let overallLossRate = 0;
  if (totalPacketsTotal > 0 && totalLost > 0) {
    const rawLoss = (totalLost / totalPacketsTotal) * 100;
    overallLossRate = Math.round(rawLoss * 10) / 10;
  }

  // Sort problem links worst first:
  // Down (0% / 0 packets) first, then descending packetsLost, then lowest rate
  problemLinks.sort((a, b) => {
    const aIsDown = (a.numRate ?? 0) === 0;
    const bIsDown = (b.numRate ?? 0) === 0;
    if (aIsDown !== bIsDown) return aIsDown ? -1 : 1;
    const lostA = a.packetsLost ?? (a.pingInfo?.packetsLost ?? 0);
    const lostB = b.packetsLost ?? (b.pingInfo?.packetsLost ?? 0);
    if (lostA !== lostB) return lostB - lostA;
    return (a.numRate ?? 0) - (b.numRate ?? 0);
  });

  // Status Category:
  // "optimal" ONLY when ZERO packets are lost across the entire network and problemLinks is empty!
  // Even one lost packet is a problem!
  const statusCategory =
    totalLost === 0 && problemLinks.length === 0
      ? "optimal"
      : (overallSuccessRate < 75 || downCount > 0)
      ? "critical"
      : "degraded";

  return {
    totalLinks: links.length,
    monitoredCount,
    totalPacketsSuccess,
    totalPacketsTotal,
    totalPacketsLost: totalLost,
    overallSuccessRate,
    overallLossRate,
    formattedRate: `${overallSuccessRate}%`,
    formattedLossRate: totalLost > 0 && overallLossRate < 0.1 ? "<0.1%" : `${overallLossRate}%`,
    formattedPackets: `${totalPacketsSuccess}/${totalPacketsTotal}`,
    healthyCount,
    degradedCount,
    downCount,
    unmonitoredCount,
    healthyPercent: monitoredCount > 0 ? Math.round((healthyCount / monitoredCount) * 100) : 0,
    degradedPercent: monitoredCount > 0 ? Math.round((degradedCount / monitoredCount) * 100) : 0,
    downPercent: monitoredCount > 0 ? Math.round((downCount / monitoredCount) * 100) : 0,
    statusCategory,
    problemLinks,
    healthyLinks,
  };
}

