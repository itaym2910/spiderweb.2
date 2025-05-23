// Cluster node definitions: 6 zones, 2 clusters each
export const NODES = [
  { id: "Cluster A1", group: "cluster", zone: "Zone 1" },
  { id: "Cluster A2", group: "cluster", zone: "Zone 1" },
  { id: "Cluster B1", group: "cluster", zone: "Zone 2" },
  { id: "Cluster B2", group: "cluster", zone: "Zone 2" },
  { id: "Cluster C1", group: "cluster", zone: "Zone 3" },
  { id: "Cluster C2", group: "cluster", zone: "Zone 3" },
  { id: "Cluster D1", group: "cluster", zone: "Zone 4" },
  { id: "Cluster D2", group: "cluster", zone: "Zone 4" },
  { id: "Cluster E1", group: "cluster", zone: "Zone 5" },
  { id: "Cluster E2", group: "cluster", zone: "Zone 5" },
  { id: "Cluster F1", group: "cluster", zone: "Zone 6" },
  { id: "Cluster F2", group: "cluster", zone: "Zone 6" },
];

// Only inter-zone links are shown
export const LINKS = [
  { id: "link-1", source: "Cluster A1", target: "Cluster B1" },
  { id: "link-2", source: "Cluster A2", target: "Cluster C2" },
  { id: "link-3", source: "Cluster B2", target: "Cluster D1" },
  { id: "link-4", source: "Cluster C1", target: "Cluster D2" },
  { id: "link-5", source: "Cluster D1", target: "Cluster E1" },
  { id: "link-6", source: "Cluster E2", target: "Cluster F1" },
  { id: "link-7", source: "Cluster F2", target: "Cluster A1" },
  { id: "link-8", source: "Cluster A1", target: "Cluster D2" },
  { id: "link-10", source: "Cluster C2", target: "Cluster E1" },
  { id: "link-11", source: "Cluster D2", target: "Cluster A2" },
  { id: "link-12", source: "Cluster E1", target: "Cluster B2" },
  { id: "link-13", source: "Cluster F1", target: "Cluster C1" },
  { id: "link-14", source: "Cluster A2", target: "Cluster E2" },
  { id: "link-15", source: "Cluster B2", target: "Cluster C2" },
  { id: "link-16", source: "Cluster D1", target: "Cluster F1" },
  { id: "link-17", source: "Cluster E2", target: "Cluster A1" },
  { id: "link-18", source: "Cluster F2", target: "Cluster B1" },

  // Duplicates with unique IDs
  { id: "link-20", source: "Cluster A2", target: "Cluster C2" },
  { id: "link-21", source: "Cluster B2", target: "Cluster D1" },
  { id: "link-22", source: "Cluster C1", target: "Cluster D2" },
  { id: "link-23", source: "Cluster D1", target: "Cluster E1" },
  { id: "link-24", source: "Cluster E2", target: "Cluster F1" },
  { id: "link-25", source: "Cluster F2", target: "Cluster A1" },
  { id: "link-26", source: "Cluster A1", target: "Cluster D2" },
  { id: "link-27", source: "Cluster B1", target: "Cluster F2" },
  { id: "link-28", source: "Cluster C2", target: "Cluster E1" },
  { id: "link-29", source: "Cluster D2", target: "Cluster A2" },
  { id: "link-30", source: "Cluster E1", target: "Cluster B2" },
  { id: "link-31", source: "Cluster F1", target: "Cluster C1" },
  { id: "link-32", source: "Cluster A2", target: "Cluster E2" },
  { id: "link-33", source: "Cluster B2", target: "Cluster C2" },
  { id: "link-34", source: "Cluster D1", target: "Cluster F1" },
  { id: "link-35", source: "Cluster E2", target: "Cluster A1" },
  { id: "link-36", source: "Cluster F2", target: "Cluster B1" },

  // Intra-zone links (each zone connects its two clusters)
  { id: "link-z1", source: "Cluster A1", target: "Cluster A2" }, // Zone 1
  { id: "link-z2", source: "Cluster B1", target: "Cluster B2" }, // Zone 2
  { id: "link-z3", source: "Cluster C1", target: "Cluster C2" }, // Zone 3
  { id: "link-z4", source: "Cluster D1", target: "Cluster D2" }, // Zone 4
  { id: "link-z5", source: "Cluster E1", target: "Cluster E2" }, // Zone 5
  { id: "link-z6", source: "Cluster F1", target: "Cluster F2" }, // Zone 6
];
