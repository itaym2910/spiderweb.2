export const NODES5 = [
  { id: "Node A1", group: "node", zone: "Zone 1" },
  { id: "Node A6", group: "node", zone: "Zone 1" },
  { id: "Node B1", group: "node", zone: "Zone 2" },
  { id: "Node B2", group: "node", zone: "Zone 2" },
  { id: "Node C1", group: "node", zone: "Zone 3" },
  { id: "Node C2", group: "node", zone: "Zone 3" },
  { id: "Node D1", group: "node", zone: "Zone 4" },
  { id: "Node D2", group: "node", zone: "Zone 4" },
  { id: "Node E1", group: "node", zone: "Zone 5" },
  { id: "Node E2", group: "node", zone: "Zone 5" },
];

export const LINKS5 = [
  // Original Set with Categories
  { id: "link-1", source: "Node A1", target: "Node B1", category: "up" },
  { id: "link-2", source: "Node A6", target: "Node C2", category: "down" },
  { id: "link-3", source: "Node B2", target: "Node D1", category: "up" },
  { id: "link-4", source: "Node C1", target: "Node D2", category: "issue" },
  { id: "link-z1", source: "Node A1", target: "Node A6", category: "up" },
  { id: "link-z2", source: "Node B1", target: "Node B2", category: "up" },
  { id: "link-z3", source: "Node C1", target: "Node C2", category: "issue" },
  { id: "link-z4", source: "Node D1", target: "Node D2", category: "up" },
  { id: "link-z5", source: "Node E1", target: "Node E2", category: "down" },
  { id: "link-5", source: "Node A1", target: "Node E1", category: "up" },
  { id: "link-6", source: "Node B1", target: "Node E2", category: "up" },
  { id: "link-7", source: "Node C2", target: "Node E1", category: "down" },
  { id: "link-8", source: "Node D2", target: "Node E2", category: "up" },
  // Duplicates with Categories
  { id: "link-dup1", source: "Node A1", target: "Node B1", category: "issue" }, // parallel
  { id: "link-dup2", source: "Node C2", target: "Node E1", category: "up" }, // parallel
  { id: "link-dup3", source: "Node B1", target: "Node E2", category: "down" }, // parallel
  { id: "link-dup4", source: "Node D2", target: "Node E2", category: "up" }, // parallel
  // New Set of 20 Links
  { id: "link-5-1", source: "Node A1", target: "Node C1", category: "up" },
  { id: "link-5-2", source: "Node A6", target: "Node B2", category: "up" },
  { id: "link-5-3", source: "Node B1", target: "Node D2", category: "issue" },
  { id: "link-5-4", source: "Node C2", target: "Node D1", category: "up" },
  { id: "link-5-5", source: "Node D1", target: "Node A1", category: "down" },
  { id: "link-5-6", source: "Node E1", target: "Node B1", category: "up" },
  { id: "link-5-7", source: "Node E2", target: "Node C1", category: "up" },
  { id: "link-5-8", source: "Node A1", target: "Node D1", category: "up" }, // parallel
  { id: "link-5-9", source: "Node B2", target: "Node E2", category: "issue" },
  { id: "link-5-10", source: "Node C1", target: "Node E1", category: "up" },
  { id: "link-5-11", source: "Node A1", target: "Node B1", category: "up" }, // 3rd link A1-B1
  { id: "link-5-12", source: "Node C2", target: "Node E1", category: "issue" }, // 4th link C2-E1
  { id: "link-5-13", source: "Node B2", target: "Node D1", category: "up" }, // parallel
  { id: "link-5-14", source: "Node D2", target: "Node A6", category: "down" },
  { id: "link-5-15", source: "Node E1", target: "Node D1", category: "up" },
  { id: "link-5-16", source: "Node A6", target: "Node E2", category: "up" },
  { id: "link-5-17", source: "Node B1", target: "Node C1", category: "issue" },
  { id: "link-5-18", source: "Node C2", target: "Node B2", category: "up" },
  { id: "link-5-19", source: "Node D1", target: "Node C1", category: "down" },
  { id: "link-5-20", source: "Node E2", target: "Node A1", category: "up" },
];
