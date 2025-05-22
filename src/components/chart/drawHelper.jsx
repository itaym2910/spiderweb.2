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
