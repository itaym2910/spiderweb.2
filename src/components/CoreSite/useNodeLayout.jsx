// src/components/CoreSite/useNodeLayout.js
export function useNodeLayout(width, height, showExtendedNodes) {
  console.log(
    "[useNodeLayout] Called with width:",
    width,
    "height:",
    height,
    "showExtendedNodes:",
    showExtendedNodes
  );

  const centerX = width / 2;
  const centerY = height / 3;
  const spacing = 100;
  const verticalOffsetForNewNodes = 2 * spacing;

  // Define all potential node data
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
  const node5Data = {
    id: "Node 5",
    x: node3Data.x,
    y: node3Data.y + verticalOffsetForNewNodes,
  };
  const node6Data = {
    id: "Node 6",
    x: node4Data.x,
    y: node4Data.y + verticalOffsetForNewNodes,
  };

  let currentNodes = [];
  const currentLinks = [];

  if (showExtendedNodes) {
    // STATE 2: Button shows "Node 1 and Node 2", so we display Nodes 3, 4, 5, 6
    currentNodes = [node3Data, node4Data, node5Data, node6Data];
    console.log(
      "[useNodeLayout] showExtendedNodes is TRUE. Displaying Nodes 3, 4, 5, 6."
    );

    // Link Node 3 to Node 5
    currentLinks.push({
      id: `link-${node3Data.id}-${node5Data.id}`,
      source: node3Data,
      target: node5Data,
    });
    // Link Node 4 to Node 6
    currentLinks.push({
      id: `link-${node4Data.id}-${node6Data.id}`,
      source: node4Data,
      target: node6Data,
    });

    // Optional: Link Node 3 to Node 4 (if they should be connected in this view)
    // currentLinks.push({
    //   id: `link-${node3Data.id}-${node4Data.id}`,
    //   source: node3Data,
    //   target: node4Data,
    // });

    // Optional: Link Node 5 to Node 6 (if they should be connected in this view)
    // currentLinks.push({
    //   id: `link-${node5Data.id}-${node6Data.id}`,
    //   source: node5Data,
    //   target: node6Data,
    // });
  } else {
    // STATE 1: Button shows "Node 5 and Node 6", so we display Nodes 1, 2, 3, 4
    currentNodes = [node1Data, node2Data, node3Data, node4Data];
    console.log(
      "[useNodeLayout] showExtendedNodes is FALSE. Displaying Nodes 1, 2, 3, 4."
    );

    // Fully connect Nodes 1, 2, 3, 4
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
  }

  console.log(
    "[useNodeLayout] Returning nodes:",
    currentNodes.map((n) => n.id).join(", "),
    "links count:",
    currentLinks.length
  );
  return { nodes: currentNodes, links: currentLinks, centerX, centerY };
}
