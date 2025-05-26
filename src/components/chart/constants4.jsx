// src/constants4.js

// 2 clusters in each of 4 zones
export const NODES4 = [
  { id: "Cluster A1", group: "cluster", zone: "Zone 1" },
  { id: "Cluster A2", group: "cluster", zone: "Zone 1" },
  { id: "Cluster B1", group: "cluster", zone: "Zone 2" },
  { id: "Cluster B2", group: "cluster", zone: "Zone 2" },
  { id: "Cluster C1", group: "cluster", zone: "Zone 3" },
  { id: "Cluster C2", group: "cluster", zone: "Zone 3" },
  { id: "Cluster D1", group: "cluster", zone: "Zone 4" },
  { id: "Cluster D2", group: "cluster", zone: "Zone 4" },
];

export const LINKS4 = [
  // ─── Core inter-zone links ───────────────────────────────────
  { id: "link-1", source: "Cluster A1", target: "Cluster B1" },
  { id: "link-2", source: "Cluster A2", target: "Cluster C2" },
  { id: "link-3", source: "Cluster B2", target: "Cluster D1" },
  { id: "link-4", source: "Cluster C1", target: "Cluster D2" },

  // ─── More cross-zone connections ────────────────────────────
  { id: "link-5", source: "Cluster D2", target: "Cluster A1" },
  { id: "link-6", source: "Cluster B1", target: "Cluster C1" },
  { id: "link-7", source: "Cluster A2", target: "Cluster D1" },
  { id: "link-8", source: "Cluster B2", target: "Cluster C2" },
  { id: "link-9", source: "Cluster A1", target: "Cluster C1" },
  { id: "link-10", source: "Cluster B2", target: "Cluster D2" },

  // ─── A few duplicates (to test multi-link hover) ─────────────
  { id: "link-11", source: "Cluster A1", target: "Cluster B1" },
  { id: "link-12", source: "Cluster A2", target: "Cluster C2" },
  { id: "link-13", source: "Cluster B2", target: "Cluster D1" },

  // ─── Intra-zone connectors ──────────────────────────────────
  { id: "link-z1", source: "Cluster A1", target: "Cluster A2" },
  { id: "link-z2", source: "Cluster B1", target: "Cluster B2" },
  { id: "link-z3", source: "Cluster C1", target: "Cluster C2" },
  { id: "link-z4", source: "Cluster D1", target: "Cluster D2" },
];
