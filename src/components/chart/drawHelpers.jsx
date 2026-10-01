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
