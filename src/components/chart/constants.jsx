// Node node definitions: 6 zones, 2 nodes each
export const NODES = [
  { id: "Node A1", group: "node", zone: "Zone 1" },
  { id: "Node A2", group: "node", zone: "Zone 1" },
  { id: "Node B1", group: "node", zone: "Zone 2" },
  { id: "Node B2", group: "node", zone: "Zone 2" },
  { id: "Node C1", group: "node", zone: "Zone 3" },
  { id: "Node C2", group: "node", zone: "Zone 3" },
  { id: "Node D1", group: "node", zone: "Zone 4" },
  { id: "Node D2", group: "node", zone: "Zone 4" },
  { id: "Node E1", group: "node", zone: "Zone 5" },
  { id: "Node E2", group: "node", zone: "Zone 5" },
  { id: "Node F1", group: "node", zone: "Zone 6" },
  { id: "Node F2", group: "node", zone: "Zone 6" },
];

// Only inter-zone links are shown
export const LINKS = [
  { id: "link-1", source: "Node A1", target: "Node B1" },
  { id: "link-2", source: "Node A2", target: "Node C2" },
  { id: "link-3", source: "Node B2", target: "Node D1" },
  { id: "link-4", source: "Node C1", target: "Node D2" },
  { id: "link-5", source: "Node D1", target: "Node E1" },
  { id: "link-6", source: "Node E2", target: "Node F1" },
  { id: "link-7", source: "Node F2", target: "Node A1" },
  { id: "link-8", source: "Node A1", target: "Node D2" },
  { id: "link-10", source: "Node C2", target: "Node E1" },
  { id: "link-11", source: "Node D2", target: "Node A2" },
  { id: "link-12", source: "Node E1", target: "Node B2" },
  { id: "link-13", source: "Node F1", target: "Node C1" },
  { id: "link-14", source: "Node A2", target: "Node E2" },
  { id: "link-15", source: "Node B2", target: "Node C2" },
  { id: "link-16", source: "Node D1", target: "Node F1" },
  { id: "link-17", source: "Node E2", target: "Node A1" },
  { id: "link-18", source: "Node F2", target: "Node B1" },

  // Duplicates with unique IDs
  { id: "link-20", source: "Node A2", target: "Node C2" },
  { id: "link-21", source: "Node B2", target: "Node D1" },
  { id: "link-22", source: "Node C1", target: "Node D2" },
  { id: "link-23", source: "Node D1", target: "Node E1" },
  { id: "link-24", source: "Node E2", target: "Node F1" },
  { id: "link-25", source: "Node F2", target: "Node A1" },
  { id: "link-26", source: "Node A1", target: "Node D2" },
  { id: "link-27", source: "Node B1", target: "Node F2" },
  { id: "link-28", source: "Node C2", target: "Node E1" },
  { id: "link-29", source: "Node D2", target: "Node A2" },
  { id: "link-30", source: "Node E1", target: "Node B2" },
  { id: "link-31", source: "Node F1", target: "Node C1" },
  { id: "link-32", source: "Node A2", target: "Node E2" },
  { id: "link-33", source: "Node B2", target: "Node C2" },
  { id: "link-34", source: "Node D1", target: "Node F1" },
  { id: "link-35", source: "Node E2", target: "Node A1" },
  { id: "link-36", source: "Node F2", target: "Node B1" },

  // Intra-zone links (each zone connects its two nodes)
  { id: "link-z1", source: "Node A1", target: "Node A2" }, // Zone 1
  { id: "link-z2", source: "Node B1", target: "Node B2" }, // Zone 2
  { id: "link-z3", source: "Node C1", target: "Node C2" }, // Zone 3
  { id: "link-z4", source: "Node D1", target: "Node D2" }, // Zone 4
  { id: "link-z5", source: "Node E1", target: "Node E2" }, // Zone 5
  { id: "link-z6", source: "Node F1", target: "Node F2" }, // Zone 6
];
