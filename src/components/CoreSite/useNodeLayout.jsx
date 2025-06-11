// src/components/CoreSite/useNodeLayout.js
export function useNodeLayout(width, height, zoneId) {
  // Log 1: Check inputs to useNodeLayout
  console.log(
    "[useNodeLayout] Called with width:",
    width,
    "height:",
    height,
    "zoneId:",
    zoneId,
    "typeof zoneId:",
    typeof zoneId
  );

  const centerX = width / 2;
  const centerY = height / 3;
  const spacing = 100;
  const verticalOffsetForNewNodes = 2 * spacing;

  const node1Data = {
    id: "Node 1",
    x: centerX - spacing,
    y: centerY - spacing,
  };
  const node2Data = {
    id: "Node 2",
    x: centerX + spacing,
    y: centerY - spacing,
  };
  const node3Data = {
    id: "Node 3",
    x: centerX + spacing,
    y: centerY + spacing,
  };
  const node4Data = {
    id: "Node 4",
    x: centerX - spacing,
    y: centerY + spacing,
  };

  // Node 5 data
  const node5Data = {
    id: "Node 5",
    x: node3Data.x,
    y: node3Data.y + verticalOffsetForNewNodes,
  };

  // Node 6 data
  const node6Data = {
    id: "Node 6",
    x: node4Data.x,
    y: node4Data.y + verticalOffsetForNewNodes,
  };

  const currentNodes = [node1Data, node2Data, node3Data, node4Data];
  const currentLinks = [];

  const baseNodesForLinking = [node1Data, node2Data, node3Data, node4Data];
  for (let i = 0; i < baseNodesForLinking.length; i++) {
    for (let j = i + 1; j < baseNodesForLinking.length; j++) {
      currentLinks.push({
        id: `link-${baseNodesForLinking[i].id}-${baseNodesForLinking[j].id}`,
        source: baseNodesForLinking[i],
        target: baseNodesForLinking[j],
      });
    }
  }

  // Check if either "Zone 5" or "Zone 6" is the current zoneId
  if (zoneId === "Zone 5" || zoneId === "Zone 6") {
    // Log 2: Condition for Zone 5 or Zone 6 is met
    console.log(
      "[useNodeLayout] zoneId is 'Zone 5' or 'Zone 6', attempting to add Node 5 and Node 6."
    );

    // Add Node 5
    currentNodes.push(node5Data);
    currentLinks.push({
      id: `link-${node3Data.id}-${node5Data.id}`,
      source: node3Data,
      target: node5Data,
    });

    // Add Node 6
    currentNodes.push(node6Data);
    currentLinks.push({
      id: `link-${node4Data.id}-${node6Data.id}`,
      source: node4Data,
      target: node6Data,
    });

    // Optional: If you want Node 5 and Node 6 to be linked to each other when they both appear
    // currentLinks.push({
    //   id: `link-${node5Data.id}-${node6Data.id}`,
    //   source: node5Data,
    //   target: node6Data,
    // });
  }

  // Log 4: Check the final nodes and links being returned
  console.log(
    "[useNodeLayout] Returning nodes:",
    currentNodes.map((n) => n.id).join(", "),
    "links count:",
    currentLinks.length
  );
  return { nodes: currentNodes, links: currentLinks, centerX, centerY };
}
