// src/components/CoreSite/useNodeLayout.js
export function useNodeLayout(
  width,
  height,
  showExtendedNodes,
  animateExtendedLayoutUp
) {
  console.log(
    "[useNodeLayout] Called with showExtendedNodes:",
    showExtendedNodes,
    "animateExtendedLayoutUp:",
    animateExtendedLayoutUp
  );

  const centerX = width / 2;
  const mainZoneCenterY = height / 3; // Center of the visual zone circle for reference
  const spacing = 100; // Standard spacing unit

  // --- Define X positions ---
  // These are consistent for both layouts relative to their group's center.
  const upperLeftX = centerX - spacing;
  const upperRightX = centerX + spacing;
  const lowerLeftX = centerX - spacing; // Same as upper for a rectangular/square layout
  const lowerRightX = centerX + spacing; // Same as upper for a rectangular/square layout

  // --- Define Y positions for the N1,N2,N3,N4 view (Layout 1) ---
  const layout1_UpperPairY = mainZoneCenterY - spacing; // For N1, N2
  const layout1_LowerPairY = mainZoneCenterY + spacing; // For N3, N4

  // --- Calculate target Y positions for Nodes 3, 4, 5, 6 (Layout 2) when animated up ---
  // This structure should mirror Layout 1
  const layout2_Target_UpperPairY = mainZoneCenterY - spacing; // For N3, N4 in their "final" position
  const layout2_Target_LowerPairY = mainZoneCenterY + spacing; // For N5, N6 in their "final" position

  // --- Initial Y positions for Nodes 5, 6 when they first appear (before upward animation) ---
  // N3, N4 start at their standard Layout 1 bottom position.
  // N5, N6 appear below that.
  const layout2_Initial_N3N4_Y = layout1_LowerPairY;
  const layout2_Initial_N5N6_Y = layout1_LowerPairY + spacing * 1.5; // Position N5, N6 further down initially

  // --- Determine current X and Y for each node based on state ---
  let n1X, n1Y, n2X, n2Y, n3X, n3Y, n4X, n4Y, n5X, n5Y, n6X, n6Y;

  if (showExtendedNodes) {
    // We are in Layout 2 (displaying N3, N4, N5, N6)
    // N1 and N2 are not part of this layout's node data.

    // Assign X positions for N3, N4, N5, N6 to mirror N1, N2, N3, N4 structure
    n3X = upperLeftX; // N3 takes N1's relative X
    n4X = upperRightX; // N4 takes N2's relative X
    n5X = lowerLeftX; // N5 takes N3's (from layout 1) relative X
    n6X = lowerRightX; // N6 takes N4's (from layout 1) relative X

    if (animateExtendedLayoutUp) {
      // FINAL ANIMATED POSITION for N3,N4,N5,N6 (mirroring N1,N2,N3,N4 layout)
      n3Y = layout2_Target_UpperPairY; // N3 is top-left
      n4Y = layout2_Target_UpperPairY; // N4 is top-right
      n5Y = layout2_Target_LowerPairY; // N5 is bottom-left
      n6Y = layout2_Target_LowerPairY; // N6 is bottom-right
      console.log(
        "[useNodeLayout] Extended & Animated Up (Mirrored Layout): N3/N4 Y:",
        n3Y,
        "N5/N6 Y:",
        n5Y
      );
    } else {
      // INITIAL APPEARANCE POSITION for N3,N4,N5,N6 (N5,N6 are lower, N3,N4 at standard bottom)
      // N3, N4 are at their "standard" bottom-of-zone position from Layout 1 initially
      n3Y = layout2_Initial_N3N4_Y;
      n4Y = layout2_Initial_N3N4_Y;
      // N5, N6 appear further down, below N3, N4
      n5Y = layout2_Initial_N5N6_Y;
      n6Y = layout2_Initial_N5N6_Y;
      console.log(
        "[useNodeLayout] Extended & Initial (N5/N6 Low): N3/N4 Y:",
        n3Y,
        "N5/N6 Y:",
        n5Y
      );
    }
  } else {
    // We are in Layout 1 (displaying N1, N2, N3, N4)
    // N5 and N6 are not part of this layout's node data.
    n1X = upperLeftX;
    n1Y = layout1_UpperPairY;
    n2X = upperRightX;
    n2Y = layout1_UpperPairY;
    n3X = lowerLeftX;
    n3Y = layout1_LowerPairY;
    n4X = lowerRightX;
    n4Y = layout1_LowerPairY;
  }

  // Define node data objects
  // Note: Only nodes relevant to the current view (determined by showExtendedNodes) will be in `currentNodes`
  const node1Data = { id: "Node 1", x: n1X, y: n1Y };
  const node2Data = { id: "Node 2", x: n2X, y: n2Y };
  const node3Data = { id: "Node 3", x: n3X, y: n3Y };
  const node4Data = { id: "Node 4", x: n4X, y: n4Y };
  const node5Data = { id: "Node 5", x: n5X, y: n5Y };
  const node6Data = { id: "Node 6", x: n6X, y: n6Y };

  let currentNodes = [];
  const currentLinks = [];

  if (showExtendedNodes) {
    // Layout 2: N3, N4, N5, N6 in a 2x2 grid
    currentNodes = [node3Data, node4Data, node5Data, node6Data];
    console.log("[useNodeLayout] Constructing Layout 2 (N3,N4,N5,N6)");

    // Create links to form a fully connected square/rectangle for N3,N4,N5,N6
    // This mirrors the links of N1,N2,N3,N4.
    const nodesForLayout2Linking = [node3Data, node4Data, node5Data, node6Data];
    // Ensure correct order for consistent linking if needed, e.g., top-left, top-right, bottom-right, bottom-left
    const layout2LinkingOrder = [
      nodesForLayout2Linking.find(
        (n) =>
          n.x === upperLeftX &&
          n.y ===
            (animateExtendedLayoutUp
              ? layout2_Target_UpperPairY
              : layout2_Initial_N3N4_Y)
      ), // N3
      nodesForLayout2Linking.find(
        (n) =>
          n.x === upperRightX &&
          n.y ===
            (animateExtendedLayoutUp
              ? layout2_Target_UpperPairY
              : layout2_Initial_N3N4_Y)
      ), // N4
      nodesForLayout2Linking.find(
        (n) =>
          n.x === lowerRightX &&
          n.y ===
            (animateExtendedLayoutUp
              ? layout2_Target_LowerPairY
              : layout2_Initial_N5N6_Y)
      ), // N6 (was N4 in original)
      nodesForLayout2Linking.find(
        (n) =>
          n.x === lowerLeftX &&
          n.y ===
            (animateExtendedLayoutUp
              ? layout2_Target_LowerPairY
              : layout2_Initial_N5N6_Y)
      ), // N5 (was N3 in original)
    ].filter(Boolean); // Filter out undefined if nodes aren't perfectly matched (shouldn't happen here)

    if (layout2LinkingOrder.length === 4) {
      // Link N3 to N4, N3 to N5
      currentLinks.push({
        id: `link-${layout2LinkingOrder[0].id}-${layout2LinkingOrder[1].id}`,
        source: layout2LinkingOrder[0],
        target: layout2LinkingOrder[1],
      }); // N3-N4
      currentLinks.push({
        id: `link-${layout2LinkingOrder[0].id}-${layout2LinkingOrder[3].id}`,
        source: layout2LinkingOrder[0],
        target: layout2LinkingOrder[3],
      }); // N3-N5 (N3 to bottom-left)

      // Link N4 to N6
      currentLinks.push({
        id: `link-${layout2LinkingOrder[1].id}-${layout2LinkingOrder[2].id}`,
        source: layout2LinkingOrder[1],
        target: layout2LinkingOrder[2],
      }); // N4-N6 (N4 to bottom-right)

      // Link N5 to N6
      currentLinks.push({
        id: `link-${layout2LinkingOrder[3].id}-${layout2LinkingOrder[2].id}`,
        source: layout2LinkingOrder[3],
        target: layout2LinkingOrder[2],
      }); // N5-N6

      // Diagonal links (optional, to make it fully connected like the original N1,N2,N3,N4)
      currentLinks.push({
        id: `link-${layout2LinkingOrder[0].id}-${layout2LinkingOrder[2].id}`,
        source: layout2LinkingOrder[0],
        target: layout2LinkingOrder[2],
      }); // N3-N6 (top-left to bottom-right)
      currentLinks.push({
        id: `link-${layout2LinkingOrder[1].id}-${layout2LinkingOrder[3].id}`,
        source: layout2LinkingOrder[1],
        target: layout2LinkingOrder[3],
      }); // N4-N5 (top-right to bottom-left)
    }
  } else {
    // Layout 1: N1, N2, N3, N4
    currentNodes = [node1Data, node2Data, node3Data, node4Data];
    console.log("[useNodeLayout] Constructing Layout 1 (N1,N2,N3,N4)");

    const nodesForLayout1Linking = [node1Data, node2Data, node4Data, node3Data]; // N1, N2, N4 (bottom-right), N3 (bottom-left)
    // This order (N1,N2,N4,N3) creates the "X" pattern plus perimeter
    for (let i = 0; i < nodesForLayout1Linking.length; i++) {
      for (let j = i + 1; j < nodesForLayout1Linking.length; j++) {
        currentLinks.push({
          id: `link-${nodesForLayout1Linking[i].id}-${nodesForLayout1Linking[j].id}`,
          source: nodesForLayout1Linking[i],
          target: nodesForLayout1Linking[j],
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
  return {
    nodes: currentNodes,
    links: currentLinks,
    centerX: centerX,
    centerY: mainZoneCenterY,
  };
}
