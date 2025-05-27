export function getNodeGroups(nodes) {
  const zoneSet = new Set(nodes.map((n) => n.zone));
  const sortedZones = Array.from(zoneSet).sort(); // e.g., ["Zone 1", ..., "Zone 6"]
  const ZONE_COUNT = sortedZones.length;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const radiusX = window.innerWidth / 3;
  const radiusY = window.innerHeight / 3.5;

  return sortedZones.map((zoneId, i) => {
    // Start from 3 o'clock (0 rad), move clockwise (add angle)
    const angle = (2 * Math.PI * i) / ZONE_COUNT;

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
