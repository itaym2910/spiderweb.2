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
  { id: "link-1", source: "Node A1", target: "Node B1" },
  { id: "link-2", source: "Node A6", target: "Node C2" },
  { id: "link-3", source: "Node B2", target: "Node D1" },
  { id: "link-4", source: "Node C1", target: "Node D2" },

  { id: "link-z1", source: "Node A1", target: "Node A6" },
  { id: "link-z2", source: "Node B1", target: "Node B2" },
  { id: "link-z3", source: "Node C1", target: "Node C2" },
  { id: "link-z4", source: "Node D1", target: "Node D2" },

  { id: "link-z5", source: "Node E1", target: "Node E2" },

  { id: "link-5", source: "Node A1", target: "Node E1" },
  { id: "link-6", source: "Node B1", target: "Node E2" },
  { id: "link-7", source: "Node C2", target: "Node E1" },
  { id: "link-8", source: "Node D2", target: "Node E2" },

  { id: "link-dup1", source: "Node A1", target: "Node B1" },
  { id: "link-dup2", source: "Node C2", target: "Node E1" },
  { id: "link-dup3", source: "Node B1", target: "Node E2" },
  { id: "link-dup4", source: "Node D2", target: "Node E2" },
];
