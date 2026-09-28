/**
 * Helper to calculate and format ping success rate and packet ratio (e.g. "80% (4/5 packets)").
 */
export function formatPingRateWithPackets(rate, packetsSuccess, packetsTotal) {
  if (rate === undefined || rate === null || rate === "") return null;
  const numRate = Number(String(rate).replace("%", "").trim());
  if (isNaN(numRate)) {
    return {
      percentage: String(rate),
      ratio: "",
      full: String(rate),
      short: String(rate),
      packetsSuccess: null,
      packetsTotal: null,
    };
  }

  let success = packetsSuccess != null ? Number(packetsSuccess) : null;
  let total = packetsTotal != null ? Number(packetsTotal) : null;

  if (success == null || total == null || isNaN(success) || isNaN(total) || total <= 0) {
    if (numRate === 100) {
      success = 5;
      total = 5;
    } else if (numRate === 0) {
      success = 0;
      total = 5;
    } else if (numRate % 20 === 0) {
      // Standard 5-packet ICMP ping probe (e.g. 80% -> 4/5, 60% -> 3/5, 40% -> 2/5, 20% -> 1/5)
      total = 5;
      success = Math.round(numRate / 20);
    } else if (numRate % 10 === 0) {
      // 10-packet probe (e.g. 90% -> 9/10, 70% -> 7/10, 30% -> 3/10)
      total = 10;
      success = Math.round(numRate / 10);
    } else if (numRate % 5 === 0) {
      // 20-packet probe (e.g. 95% -> 19/20, 85% -> 17/20, 75% -> 15/20)
      total = 20;
      success = Math.round((numRate / 100) * 20);
    } else {
      total = 100;
      success = Math.round(numRate);
    }
  }

  const pctStr = `${numRate}%`;
  const ratioStr = `${success}/${total} packets`;
  const shortRatioStr = `${success}/${total}`;

  return {
    percentage: pctStr,
    ratio: ratioStr,
    full: `${pctStr} (${ratioStr})`,
    short: `${pctStr} (${shortRatioStr})`,
    packetsSuccess: success,
    packetsTotal: total,
  };
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
    const rawRate = l.ping_success_rate ?? l.rawLink?.ping_success_rate;
    if (rawRate === undefined || rawRate === null || rawRate === "") {
      unmonitoredCount++;
      return;
    }

    const packetsSuccess =
      l.ping_packets_success ??
      l.rawLink?.ping_packets_success ??
      l.packets_success;
    const packetsTotal =
      l.ping_packets_total ??
      l.rawLink?.ping_packets_total ??
      l.packets_total;
    const info = formatPingRateWithPackets(rawRate, packetsSuccess, packetsTotal);

    if (!info) {
      unmonitoredCount++;
      return;
    }

    const s = info.packetsSuccess ?? 0;
    const t = info.packetsTotal ?? 0;
    const numRate = Number(String(rawRate).replace("%", "").trim());

    totalPacketsSuccess += s;
    totalPacketsTotal += t;

    const enriched = { ...l, pingInfo: info, numRate };

    if (numRate >= 100) {
      healthyCount++;
      healthyLinks.push(enriched);
    } else if (numRate > 0) {
      degradedCount++;
      problemLinks.push(enriched);
    } else {
      downCount++;
      problemLinks.push(enriched);
    }
  });

  const monitoredCount = healthyCount + degradedCount + downCount;
  const totalLost = Math.max(0, totalPacketsTotal - totalPacketsSuccess);
  const overallSuccessRate =
    totalPacketsTotal > 0
      ? Math.round((totalPacketsSuccess / totalPacketsTotal) * 1000) / 10
      : 0;
  const overallLossRate =
    totalPacketsTotal > 0
      ? Math.round((totalLost / totalPacketsTotal) * 1000) / 10
      : 0;

  // Sort problem links worst first (0% first, then ascending rate)
  problemLinks.sort((a, b) => a.numRate - b.numRate);

  const statusCategory =
    overallSuccessRate >= 95 ? "optimal" : overallSuccessRate >= 75 ? "degraded" : "critical";

  return {
    totalLinks: links.length,
    monitoredCount,
    totalPacketsSuccess,
    totalPacketsTotal,
    totalPacketsLost: totalLost,
    overallSuccessRate,
    overallLossRate,
    formattedRate: `${overallSuccessRate}%`,
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

