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
  { id: "link-1", source: "Cluster A1", target: "Cluster B1" },
  { id: "link-2", source: "Cluster A2", target: "Cluster C2" },
  { id: "link-3", source: "Cluster B2", target: "Cluster D1" },
  { id: "link-4", source: "Cluster C1", target: "Cluster D2" },

  { id: "link-z1", source: "Cluster A1", target: "Cluster A2" },
  { id: "link-z2", source: "Cluster B1", target: "Cluster B2" },
  { id: "link-z3", source: "Cluster C1", target: "Cluster C2" },
  { id: "link-z4", source: "Cluster D1", target: "Cluster D2" },
];
