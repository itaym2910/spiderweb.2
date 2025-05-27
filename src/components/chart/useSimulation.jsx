import * as d3 from "d3";
import { NODE_GROUPS } from "./drawHelpers";

function avoidLinksForce(nodes, links, padding = 80) {
  return () => {
    links.forEach((link) => {
      const source = nodes.find(
        (n) => n.id === link.source.id || n.id === link.source
      );
      const target = nodes.find(
        (n) => n.id === link.target.id || n.id === link.target
      );
      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const linkLength = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / linkLength;
      const uy = dy / linkLength;

      nodes.forEach((node) => {
        if (node === source || node === target) return; // skip connected nodes

        // project node onto the link vector
        const px = node.x - source.x;
        const py = node.y - source.y;
        const proj = px * ux + py * uy;

        if (proj < 0 || proj > linkLength) return; // node is outside segment bounds

        // perpendicular distance from node to link
        const perpX = px - proj * ux;
        const perpY = py - proj * uy;
        const perpDist = Math.sqrt(perpX * perpX + perpY * perpY);

        if (perpDist < padding) {
          const angle = Math.atan2(perpY, perpX);
          const repelStrength = 3 * (1 - perpDist / padding); // stronger when closer
          const push = repelStrength * (padding - perpDist);

          node.vx += Math.cos(angle) * push * 0.1;
          node.vy += Math.sin(angle) * push * 0.1;
        }
      });
    });
  };
}

export function createSimulation(nodes, links, onTick) {
  return d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance((d) => {
          const sameZone = d.source.zone === d.target.zone;
          return sameZone ? 120 : 180; // shorter inter-zone pull distance
        })
        .strength((d) => {
          const sameZone = d.source.zone === d.target.zone;
          return sameZone ? 0 : 0.3; // 💪 stronger inter-zone pull
        })
    )

    .force(
      "x",
      d3
        .forceX((d) => {
          const zone = NODE_GROUPS.find((z) => z.id === d.zone);
          return zone?.cx ?? window.innerWidth / 2;
        })
        .strength(0.05)
    )
    .force(
      "y",
      d3
        .forceY((d) => {
          const zone = NODE_GROUPS.find((z) => z.id === d.zone);
          return zone?.cy ?? window.innerHeight / 2;
        })
        .strength(0.05)
    )
    .force(
      "collide",
      d3
        .forceCollide()
        .radius(60 + 4)
        .strength(1) // 60 is node radius, +4 for spacing
    )

    .force("charge", d3.forceManyBody().strength(-30))
    .force(
      "centerPull",
      d3
        .forceRadial(0, window.innerWidth / 2, window.innerHeight / 2)
        .strength(0.01)
    )
    .force("avoidLinks", avoidLinksForce(nodes, links, 80))
    .velocityDecay(0.2) // allows forces like avoidLinks to push nodes more effectively

    .on("tick", onTick);
}
