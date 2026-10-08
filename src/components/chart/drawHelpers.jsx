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
  return s !== "" && s !== "null" && s !== "undefined" && s !== "none";
}

/**
 * Determines a link's status ("up" | "issue" | "down") and its corresponding timestamp
 * according to the following rules:
 * - down:  oper status !== up && last down at date !== null (timestamp = last down at)
 * - issue: oper status = up && ospf state !== full && last ospf full date !== null (timestamp = last ospf full date)
 * - up:    oper status = up && last up at date !== null (timestamp = last up at)
 * Note: If oper status = up && ospf state !== full but last ospf full date === null, it has UP status (not issue).
 */
export function getLinkStatusAndDate(link) {
  if (!link) return { status: "up", statusDate: null };

  const raw = link.rawLink || link;

  // Extract dates
  const lastUpAt = hasValidDate(raw.last_up_at)
    ? raw.last_up_at
    : (hasValidDate(link.last_up_at) ? link.last_up_at : null);

  const lastDownAt = hasValidDate(raw.last_down_at)
    ? raw.last_down_at
    : (hasValidDate(link.last_down_at) ? link.last_down_at : null);

  const lastOspfFullAt = hasValidDate(raw.last_ospf_full_at)
    ? raw.last_ospf_full_at
    : (hasValidDate(link.last_ospf_full_at) ? link.last_ospf_full_at : null);

  const operStatus = String(
    raw.oper_status !== undefined
      ? raw.oper_status
      : (link.oper_status !== undefined
          ? link.oper_status
          : (raw.physical_status || link.physical_status || raw.status || link.status || ""))
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

  // Rule 1: down -> oper status !== up && last down at date !== null
  // (timestamp will be the date in the last down at date field)
  if (operStatus !== "up" && lastDownAt !== null) {
    return { status: "down", statusDate: lastDownAt };
  }

  // Rule 2: issue -> oper status = up && ospf state !== full && last ospf full date !== null
  // (timestamp will be the date in the last ospf full date field)
  if (operStatus === "up" && !isOspfFull && lastOspfFullAt !== null) {
    return { status: "issue", statusDate: lastOspfFullAt };
  }

  // Rule 3: up -> oper status = up && last up at date !== null
  // (timestamp will be the date in the last up at date field)
  // If oper status = up && ospf state !== full but last ospf full date === null, it has UP status
  if (operStatus === "up" && lastUpAt !== null) {
    return { status: "up", statusDate: lastUpAt };
  }

  // Fallbacks if one of the specific date fields is missing:
  if (operStatus !== "up") {
    return {
      status: "down",
      statusDate: lastDownAt || raw.last_state_change_at || link.last_state_change_at || raw.updated_at || link.updated_at || null,
    };
  }

  // operStatus === "up":
  return {
    status: "up",
    statusDate: lastUpAt || raw.last_state_change_at || link.last_state_change_at || raw.created_at || link.created_at || null,
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
export function normalizeInterfaceName(raw) {
  if (!raw) return "";
  let name = String(raw).trim().toLowerCase();
  if (!name) return "";

  // Remove whitespace
  name = name.replace(/\s+/g, "");

  // Packet-over-SONET: POS or PO with slashes
  // Matches: pos0/1/1, pos-0/1/1, po0/1/1, po-0/1/1, pos0/0/0/0, po0/0/0/0
  if (/^pos(?:\d|[-_\/])/i.test(name)) {
    return name.replace(/^pos/i, "pos");
  }
  if (/^po(?:\d|[-_\/])/i.test(name) && name.includes("/")) {
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
  if (/^(?:gigabitethernet|gigethernet|gige|ge|gi)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:gigabitethernet|gigethernet|gige|ge|gi)/i, "gi");
  }

  // TenGigabitEthernet: tengigabitethernet, tengigethernet, tengige, xge, te, tg
  if (/^(?:tengigabitethernet|tengigethernet|tengige|xge|te|tg)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:tengigabitethernet|tengigethernet|tengige|xge|te|tg)/i, "te");
  }

  // TwentyFiveGigE: twentyfivegigabitethernet, twentyfivegige, twentyfivegig, 25gige, 25ge, tf, twe
  if (/^(?:twentyfivegigabitethernet|twentyfivegige|twentyfivegig|25gige|25ge|tf|twe)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:twentyfivegigabitethernet|twentyfivegige|twentyfivegig|25gige|25ge|tf|twe)/i, "25ge");
  }

  // FortyGigE: fortygigabitethernet, fortygige, 40gige, 40ge, fo
  if (/^(?:fortygigabitethernet|fortygige|40gige|40ge|fo)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:fortygigabitethernet|fortygige|40gige|40ge|fo)/i, "fo");
  }

  // HundredGigE: hundredgigabitethernet, hundredgige, 100gige, 100ge, hu
  if (/^(?:hundredgigabitethernet|hundredgige|100gige|100ge|hu)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:hundredgigabitethernet|hundredgige|100gige|100ge|hu)/i, "hu");
  }

  // FourHundredGigE: fourhundredgigabitethernet, fourhundredgige, 400gige, 400ge, fh
  if (/^(?:fourhundredgigabitethernet|fourhundredgige|400gige|400ge|fh)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:fourhundredgigabitethernet|fourhundredgige|400gige|400ge|fh)/i, "400ge");
  }

  // FastEthernet: fastethernet, fasteth, fa, fe
  if (/^(?:fastethernet|fasteth|fa|fe)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:fastethernet|fasteth|fa|fe)/i, "fa");
  }

  // Ethernet: ethernet, eth
  if (/^(?:ethernet|eth)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:ethernet|eth)/i, "eth");
  }

  // Loopback: loopback, lo
  if (/^(?:loopback|lo)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:loopback|lo)/i, "lo");
  }

  // Management: management, mgmt, ma
  if (/^(?:management|mgmt|ma)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:management|mgmt|ma)/i, "mgmt");
  }

  // Serial: serial, ser, se
  if (/^(?:serial|ser|se)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:serial|ser|se)/i, "se");
  }

  // Vlan: vlan, vl
  if (/^(?:vlan|vl)(?=\d|[-_\/])/i.test(name)) {
    return name.replace(/^(?:vlan|vl)/i, "vlan");
  }

  return name;
}
