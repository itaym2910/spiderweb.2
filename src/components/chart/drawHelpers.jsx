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

export function normalizeLinkStatus(link) {
  if (!link) return "up";

  if (link.normalizedStatus) {
    const norm = String(link.normalizedStatus).toLowerCase().trim();
    if (norm === "down" || norm === "issue" || norm === "up") return norm;
  }

  const s = String(link.status || "").toLowerCase().trim();
  const p = String(
    link.physical_status || link.physicalStatus || ""
  ).toLowerCase().trim();
  const proto = String(
    link.protocol_status || link.protocolStatus || ""
  ).toLowerCase().trim();
  const cat = String(link.category || "").toLowerCase().trim();

  // If any status field indicates down, it is strictly down
  if (
    s === "down" ||
    p === "down" ||
    proto === "down" ||
    cat === "down" ||
    s.includes("down") ||
    p.includes("down") ||
    proto.includes("down") ||
    cat.includes("down")
  ) {
    return "down";
  }

  // If any status field indicates an issue or warning
  if (
    s === "issue" ||
    p === "issue" ||
    cat === "issue" ||
    s === "warning" ||
    p === "warning" ||
    cat === "warning" ||
    s.includes("issue") ||
    s.includes("warning")
  ) {
    return "issue";
  }

  return "up";
}
