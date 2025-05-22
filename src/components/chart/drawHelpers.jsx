export const CLUSTER_GROUPS = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 6; // Even 60° steps (like a clock face)
  const radiusX = window.innerWidth / 3; // Oval width (horizontal stretch)
  const radiusY = window.innerHeight / 3; // Oval height (vertical compress)

  return {
    id: `Zone ${i + 1}`,
    cx: window.innerWidth / 2 + radiusX * Math.cos(angle),
    cy: window.innerHeight / 2 + radiusY * Math.sin(angle),
  };
});

export function constrainToZone(
  d,
  clusterGroups,
  nodeRadius = 60,
  zoneRadius = 150
) {
  const zone = clusterGroups.find((z) => z.id === d.zone);
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
