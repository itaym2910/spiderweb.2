export function getNodeGroups(nodes) {
  const zoneSet = new Set(nodes.map((n) => n.zone));
  const sortedZones = Array.from(zoneSet).sort();
  const ZONE_COUNT = sortedZones.length;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const radiusX = window.innerWidth / 3;
  const radiusY = window.innerHeight / 3.5;

  return sortedZones.map((zoneId, i) => {
    const angleOffset = ZONE_COUNT % 2 === 1 ? -Math.PI / 2 : 0;

    const angle = (2 * Math.PI * i) / ZONE_COUNT + angleOffset;

    return {
      id: zoneId,
      angle,
      cx: centerX + radiusX * Math.cos(angle),
      cy: centerY + radiusY * Math.sin(angle),
    };
  });
}

export function constrainToZone(
  d,
  nodeGroups,
  nodeRadius = 60,
  zoneRadius = 150
) {
  const zone = nodeGroups.find((z) => z.id === d.zone);
  if (!zone) return;

  const dx = d.x - zone.cx;
  const dy = d.y - zone.cy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const maxDistance = zoneRadius - nodeRadius; // adjust to keep entire node inside

  if (distance > maxDistance) {
    const angle = Math.atan2(dy, dx);
    d.x = zone.cx + maxDistance * Math.cos(angle);
    d.y = zone.cy + maxDistance * Math.sin(angle);
  }
}

export function linkPositionFromEdges(d, r = 60) {
  const dx = d.target.x - d.source.x;
  const dy = d.target.y - d.source.y;
  const angle1 = Math.atan2(dy, dx);
  const angle2 = Math.atan2(-dy, -dx);

  return {
    x1: d.source.x + r * Math.cos(angle1),
    y1: d.source.y + r * Math.sin(angle1),
    x2: d.target.x + r * Math.cos(angle2),
    y2: d.target.y + r * Math.sin(angle2),
  };
}

export function hasValidDate(val) {
  if (val === null || val === undefined) return false;
  const s = String(val).trim().toLowerCase();
  if (s === "" || s === "null" || s === "undefined" || s === "none") return false;
  const d = new Date(val);
  return !isNaN(d.getTime());
}

/**
 * Parses duration in seconds from either:
 * - A numeric value (e.g. 424720)
 * - A numeric string (e.g. "424720")
 * - A duration string (e.g. "4d21h", "4d 21h", "1w2d", "12h", "45m", "30s", "01:23:45")
 */
export function parseDurationToSeconds(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") {
    return isNaN(val) || val < 0 ? null : val;
  }
  const str = String(val).trim();
  if (str === "" || str === "null" || str === "undefined" || str === "none") return null;

  // Pure numeric string
  if (/^\d+(\.\d+)?$/.test(str)) {
    const num = Number(str);
    return isNaN(num) || num < 0 ? null : num;
  }

  // Check colon format e.g. "01:23:45"
  const colonMatch = str.match(/^(\d+):(\d{2}):(\d{2})$/);
  if (colonMatch) {
    return Number(colonMatch[1]) * 3600 + Number(colonMatch[2]) * 60 + Number(colonMatch[3]);
  }

  let totalSec = 0;
  let matched = false;

  const wMatch = str.match(/(\d+(?:\.\d+)?)\s*w/i);
  if (wMatch) { totalSec += Number(wMatch[1]) * 7 * 86400; matched = true; }

  const dMatch = str.match(/(\d+(?:\.\d+)?)\s*d/i);
  if (dMatch) { totalSec += Number(dMatch[1]) * 86400; matched = true; }

  const hMatch = str.match(/(\d+(?:\.\d+)?)\s*h/i);
  if (hMatch) { totalSec += Number(hMatch[1]) * 3600; matched = true; }

  const mMatch = str.match(/(\d+(?:\.\d+)?)\s*m(?!s)/i);
  if (mMatch) { totalSec += Number(mMatch[1]) * 60; matched = true; }

  const sMatch = str.match(/(\d+(?:\.\d+)?)\s*s/i);
  if (sMatch) { totalSec += Number(sMatch[1]); matched = true; }

  return matched ? totalSec : null;
}

/**
 * Converts a duration in seconds into an ISO timestamp string representing `Date.now() - seconds * 1000`.
 */
export function durationSecondsToIsoTimestamp(seconds) {
  if (seconds === null || seconds === undefined) return null;
  const num = typeof seconds === "number" ? seconds : Number(String(seconds).trim());
  if (isNaN(num) || num < 0) return null;
  return new Date(Date.now() - num * 1000).toISOString();
}

/**
 * Calculates missing packets from ping_success_attempts (e.g. "10000/10000", "9990/10000")
 * or separate packets success/total fields.
 */
export function getMissingPacketsCount(link) {
  if (!link) return 0;
  const raw = link.rawLink || link;

  const attempts =
    raw.ping_success_attempts ??
    link.ping_success_attempts ??
    raw.ping_packets_success ??
    link.ping_packets_success ??
    raw.ping_ratio ??
    link.ping_ratio;

  if (attempts !== undefined && attempts !== null) {
    const s = String(attempts).trim();
    const match = s.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (match) {
      const succ = Number(match[1]);
      const tot = Number(match[2]);
      if (!isNaN(succ) && !isNaN(tot) && tot >= succ) {
        return Math.max(0, tot - succ);
      }
    }
  }

  const total =
    raw.ping_packets_total ??
    link.ping_packets_total ??
    raw.ping_total ??
    link.ping_total ??
    raw.total_pings ??
    link.total_pings;

  const success =
    raw.ping_packets_success ??
    link.ping_packets_success ??
    raw.ping_success ??
    link.ping_success;

  if (total != null && success != null) {
    const t = Number(total);
    const sc = Number(success);
    if (!isNaN(t) && !isNaN(sc) && t >= sc) {
      return Math.max(0, t - sc);
    }
  }

  const rateVal =
    raw.ping_success_rate ??
    link.ping_success_rate ??
    raw.ping_rate ??
    link.ping_rate;

  if (rateVal != null) {
    const r = Number(String(rateVal).replace("%", "").trim());
    if (!isNaN(r) && r < 100) {
      const missing = Math.round(((100 - r) / 100) * 10000);
      return Math.max(0, missing);
    }
  }

  return 0;
}

/**
 * Determines a link's classification ("up" | "down" | "issue") and its corresponding timestamp
 * according to the following rules:
 *
 * down: oper_status !== "up" || ospf_state !== "full" || remote_oper_status !== "up"
 *       for timestamp:
 *         1. ospf_state_duration_seconds ("ospf_state_duration_seconds": 424720)
 *         2. else ospf_state_duration ("ospf_state_duration": "4d21h")
 *         3. else last_ospf_down_at ("last_ospf_down_at": "2026-09-20T00:34:20.868836+03:00")
 *
 * issue: ping_success_attempts has at least 10 missing packets ("ping_success_attempts": "10000/10000")
 *       for timestamp:
 *         1. last_ping_at ("last_ping_at": "2026-10-12T08:41:32.983566+00:00")
 *
 * up:   oper_status === "up"
 *       for timestamp:
 *         1. ospf_up_time_seconds ("ospf_up_time_seconds": 424720)
 *         2. else ospf_up_time ("ospf_up_time": "4d21h")
 *         3. else last_up_at ("last_up_at": "2026-09-20T00:34:20.868836+03:00")
 */
export function getLinkStatusAndDate(link) {
  if (!link) return { status: "up", statusDate: null };

  const raw = link.rawLink || link;

  const operStatus = String(
    raw.oper_status !== undefined
      ? raw.oper_status
      : (link.oper_status !== undefined
          ? link.oper_status
          : (raw.physical_status || link.physical_status || raw.status || link.status || ""))
  ).toLowerCase().trim();

  const remoteOperStatus = String(
    raw.remote_oper_status !== undefined
      ? raw.remote_oper_status
      : (link.remote_oper_status !== undefined
          ? link.remote_oper_status
          : (raw.remoteOperStatus || link.remoteOperStatus || raw.remote_physical_status || link.remote_physical_status || "up"))
  ).toLowerCase().trim();

  const ospfState = String(
    raw.ospf_state !== undefined
      ? raw.ospf_state
      : (link.ospf_state !== undefined
          ? link.ospf_state
          : (raw.ospf || link.ospf || raw.ospfStatus || link.ospfStatus || ""))
  ).toLowerCase().trim();

  const isOspfFull = raw.is_ospf_full !== undefined
    ? Boolean(raw.is_ospf_full)
    : (link.is_ospf_full !== undefined ? Boolean(link.is_ospf_full) : ospfState === "full");

  const missingPackets = getMissingPacketsCount(link);

  // 1. down: oper_status !== "up" || ospf_state !== "full" || remote_oper_status !== "up"
  if (operStatus !== "up" || !isOspfFull || remoteOperStatus !== "up") {
    const ospfStateDurationSeconds =
      raw.ospf_state_duration_seconds ??
      link.ospf_state_duration_seconds ??
      raw.ospfStateDurationSeconds ??
      link.ospfStateDurationSeconds;

    const ospfStateDuration =
      raw.ospf_state_duration ??
      link.ospf_state_duration ??
      raw.ospfStateDuration ??
      link.ospfStateDuration;

    const lastOspfDownAt =
      raw.last_ospf_down_at ??
      link.last_ospf_down_at ??
      raw.lastOspfDownAt ??
      link.lastOspfDownAt;

    let statusDate = null;
    let rawTimestamp = null;
    let durationSeconds = null;

    if (ospfStateDurationSeconds !== undefined && ospfStateDurationSeconds !== null) {
      const sec = parseDurationToSeconds(ospfStateDurationSeconds);
      if (sec !== null) {
        statusDate = durationSecondsToIsoTimestamp(sec);
        rawTimestamp = ospfStateDurationSeconds;
        durationSeconds = sec;
      }
    }

    if (!statusDate && ospfStateDuration !== undefined && ospfStateDuration !== null) {
      const sec = parseDurationToSeconds(ospfStateDuration);
      if (sec !== null) {
        statusDate = durationSecondsToIsoTimestamp(sec);
        rawTimestamp = ospfStateDuration;
        durationSeconds = sec;
      }
    }

    if (!statusDate && hasValidDate(lastOspfDownAt)) {
      statusDate = String(lastOspfDownAt);
      rawTimestamp = lastOspfDownAt;
    }

    // Fallbacks
    if (!statusDate) {
      statusDate =
        raw.last_down_at ||
        link.last_down_at ||
        raw.status_changed_at ||
        link.status_changed_at ||
        raw.last_state_change_at ||
        link.last_state_change_at ||
        raw.updated_at ||
        link.updated_at ||
        null;
      rawTimestamp = statusDate;
    }

    return {
      status: "down",
      statusDate,
      rawTimestamp,
      durationSeconds,
    };
  }

  // 2. issue: ping_success_attempts has at least 10 missing packets
  if (missingPackets >= 10) {
    const lastPingAt =
      raw.last_ping_at ??
      link.last_ping_at ??
      raw.lastPingAt ??
      link.lastPingAt;

    let statusDate = null;
    let rawTimestamp = null;

    if (hasValidDate(lastPingAt)) {
      statusDate = String(lastPingAt);
      rawTimestamp = lastPingAt;
    } else {
      statusDate =
        raw.status_changed_at ||
        link.status_changed_at ||
        raw.last_state_change_at ||
        link.last_state_change_at ||
        raw.updated_at ||
        link.updated_at ||
        null;
      rawTimestamp = statusDate;
    }

    return {
      status: "issue",
      statusDate,
      rawTimestamp,
      missingPackets,
    };
  }

  // 3. up: oper_status === "up"
  const ospfUpTimeSeconds =
    raw.ospf_up_time_seconds ??
    link.ospf_up_time_seconds ??
    raw.ospfUpTimeSeconds ??
    link.ospfUpTimeSeconds;

  const ospfUpTime =
    raw.ospf_up_time ??
    link.ospf_up_time ??
    raw.ospfUpTime ??
    link.ospfUpTime;

  const lastUpAt =
    raw.last_up_at ??
    link.last_up_at ??
    raw.lastUpAt ??
    link.lastUpAt;

  let statusDate = null;
  let rawTimestamp = null;
  let durationSeconds = null;

  if (ospfUpTimeSeconds !== undefined && ospfUpTimeSeconds !== null) {
    const sec = parseDurationToSeconds(ospfUpTimeSeconds);
    if (sec !== null) {
      statusDate = durationSecondsToIsoTimestamp(sec);
      rawTimestamp = ospfUpTimeSeconds;
      durationSeconds = sec;
    }
  }

  if (!statusDate && ospfUpTime !== undefined && ospfUpTime !== null) {
    const sec = parseDurationToSeconds(ospfUpTime);
    if (sec !== null) {
      statusDate = durationSecondsToIsoTimestamp(sec);
      rawTimestamp = ospfUpTime;
      durationSeconds = sec;
    }
  }

  if (!statusDate && hasValidDate(lastUpAt)) {
    statusDate = String(lastUpAt);
    rawTimestamp = lastUpAt;
  }

  // Fallbacks
  if (!statusDate) {
    statusDate =
      raw.status_changed_at ||
      link.status_changed_at ||
      raw.last_state_change_at ||
      link.last_state_change_at ||
      raw.created_at ||
      link.created_at ||
      raw.updated_at ||
      link.updated_at ||
      null;
    rawTimestamp = statusDate;
  }

  return {
    status: "up",
    statusDate,
    rawTimestamp,
    durationSeconds,
  };
}

export function normalizeLinkStatus(link) {
  return getLinkStatusAndDate(link).status;
}

/**
 * Normalizes interface names across vendor variants, abbreviations, and case differences.
 * e.g.,
 *   PO0/1/1, POS0/1/1, pos 0/1/1 -> pos0/1/1
 *   GigabitEthernet0/1/0, Gi0/1/0, GigE0/1/0 -> gi0/1/0
 *   TenGigE0/1/0/0, Te0/1/0/0 -> te0/1/0/0
 *   HundredGigE0/0/0/0, Hu0/0/0/0, 100GE0/0/0/0 -> hu0/0/0/0
 *   Bundle-Ether1, BE1 -> be1
 *   Port-Channel5, Po5 -> po5
 */
/**
 * Normalizes a device name into a clean, canonical key for link deduplication.
 * Strips FQDN domain suffixes, trims whitespace, and converts to lowercase.
 */
export function cleanDeviceKey(raw) {
  if (!raw) return "";
  let name = String(raw).trim().toLowerCase();
  if (name.includes(".")) {
    name = name.split(".")[0];
  }
  return name;
}

export function normalizeInterfaceName(raw) {
  if (!raw) return "";
  let name = String(raw).trim().toLowerCase();
  if (!name) return "";

  // Remove whitespace
  name = name.replace(/\s+/g, "");

  // Packet-over-SONET / SDH: pos, packet-over-sonet, packet-over-sdh, sonet, or po with slashes
  // Matches: pos0/1/1, pos-0/1/1, po0/1/1, po-0/1/1, pos0/0/0/0, po0/0/0/0
  if (/^(?:packet-over-sonet|packetover-sonet|packet-over-sdh|packetover-sdh|sonet|pos)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:packet-over-sonet|packetover-sonet|packet-over-sdh|packetover-sdh|sonet|pos)/i, "pos");
  }
  if (/^po(?=\d|[-_/])/i.test(name) && name.includes("/")) {
    return name.replace(/^po/i, "pos");
  }

  // Port-channel (without /)
  if (/^(?:port-channel|portchannel|po)(?:\d|[-_])/i.test(name)) {
    return name.replace(/^(?:port-channel|portchannel|po)/i, "po");
  }

  // Bundle-Ether / BE
  if (/^(?:bundle-ether|bundle-ethernet|bundle|be)(?:\d|[-_])/i.test(name)) {
    return name.replace(/^(?:bundle-ether|bundle-ethernet|bundle|be)/i, "be");
  }

  // GigabitEthernet: gigabitethernet, gigethernet, gige, ge, gi
  if (/^(?:gigabitethernet|gigethernet|gige|ge|gi)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:gigabitethernet|gigethernet|gige|ge|gi)/i, "gi");
  }

  // TenGigabitEthernet: tengigabitethernet, tengigethernet, tengige, xge, te, tg
  if (/^(?:tengigabitethernet|tengigethernet|tengige|xge|te|tg)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:tengigabitethernet|tengigethernet|tengige|xge|te|tg)/i, "te");
  }

  // TwentyFiveGigE: twentyfivegigabitethernet, twentyfivegige, twentyfivegig, 25gige, 25ge, tf, twe
  if (/^(?:twentyfivegigabitethernet|twentyfivegige|twentyfivegig|25gige|25ge|tf|twe)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:twentyfivegigabitethernet|twentyfivegige|twentyfivegig|25gige|25ge|tf|twe)/i, "25ge");
  }

  // FortyGigE: fortygigabitethernet, fortygige, 40gige, 40ge, fo
  if (/^(?:fortygigabitethernet|fortygige|40gige|40ge|fo)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:fortygigabitethernet|fortygige|40gige|40ge|fo)/i, "fo");
  }

  // HundredGigE: hundredgigabitethernet, hundredgige, 100gige, 100ge, hu
  if (/^(?:hundredgigabitethernet|hundredgige|100gige|100ge|hu)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:hundredgigabitethernet|hundredgige|100gige|100ge|hu)/i, "hu");
  }

  // FourHundredGigE: fourhundredgigabitethernet, fourhundredgige, 400gige, 400ge, fh
  if (/^(?:fourhundredgigabitethernet|fourhundredgige|400gige|400ge|fh)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:fourhundredgigabitethernet|fourhundredgige|400gige|400ge|fh)/i, "400ge");
  }

  // FastEthernet: fastethernet, fasteth, fa, fe
  if (/^(?:fastethernet|fasteth|fa|fe)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:fastethernet|fasteth|fa|fe)/i, "fa");
  }

  // Ethernet: ethernet, eth
  if (/^(?:ethernet|eth)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:ethernet|eth)/i, "eth");
  }

  // Loopback: loopback, lo
  if (/^(?:loopback|lo)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:loopback|lo)/i, "lo");
  }

  // Management: management, mgmt, ma
  if (/^(?:management|mgmt|ma)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:management|mgmt|ma)/i, "mgmt");
  }

  // Serial: serial, ser, se
  if (/^(?:serial|ser|se)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:serial|ser|se)/i, "se");
  }

  // Vlan: vlan, vl
  if (/^(?:vlan|vl)(?=\d|[-_/])/i.test(name)) {
    return name.replace(/^(?:vlan|vl)/i, "vlan");
  }

  return name;
}
