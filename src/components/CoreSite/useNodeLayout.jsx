import { cleanDeviceKey } from "../chart/drawHelpers";

export function useNodeLayout(
  width,
  height,
  showExtendedNodes,
  animateExtendedLayoutUp,
  devicesForZone = [],
  allLinksForChart = []
) {
  const centerX = width / 2;
  const mainZoneCenterY = height / 3;
  const spacing = 100;

  // --- Define X positions (consistent for both layouts) ---
  const upperLeftX = centerX - spacing;
  const upperRightX = centerX + spacing;
  const lowerLeftX = centerX - spacing;
  const lowerRightX = centerX + spacing;

  // --- Define Y positions for the initial 4-node layout ---
  const layout1_UpperPairY = mainZoneCenterY - spacing;
  const layout1_LowerPairY = mainZoneCenterY + spacing;

  // --- Y positions for the extended 6-node layout (animation targets) ---
  const layout2_Target_UpperPairY = mainZoneCenterY - spacing;
  const layout2_Target_LowerPairY = mainZoneCenterY + spacing;

  // --- Initial Y positions for the extended layout (before upward animation) ---
  const layout2_Initial_UpperPairY = layout1_LowerPairY;
  const layout2_Initial_LowerPairY = layout1_LowerPairY + spacing * 1.5;

  let nodePositions = [];
  let currentDevices = [];
  let currentNodes = [];

  if (showExtendedNodes) {
    // --- EXTENDED LAYOUT ---
    // This layout shows devices from index 2 to 5.
    currentDevices = devicesForZone.slice(2, 6);

    // Calculate the positions for the 4 slots in this view
    const p1_X = upperLeftX;
    const p2_X = upperRightX;
    const p3_X = lowerLeftX;
    const p4_X = lowerRightX;

    let p1_Y, p2_Y, p3_Y, p4_Y;

    if (animateExtendedLayoutUp) {
      // Final animated positions
      p1_Y = p2_Y = layout2_Target_UpperPairY;
      p3_Y = p4_Y = layout2_Target_LowerPairY;
    } else {
      // Initial positions (lower on the screen)
      p1_Y = p2_Y = layout2_Initial_UpperPairY;
      p3_Y = p4_Y = layout2_Initial_LowerPairY;
    }
    nodePositions = [
      { x: p1_X, y: p1_Y },
      { x: p2_X, y: p2_Y },
      { x: p3_X, y: p3_Y },
      { x: p4_X, y: p4_Y },
    ];
  } else {
    // --- INITIAL LAYOUT ---
    // This layout shows devices from index 0 to 3.
    currentDevices = devicesForZone.slice(0, 4);

    if (devicesForZone.length <= 2) {
      // Center the two devices
      nodePositions = [
        { x: upperLeftX, y: mainZoneCenterY },
        { x: upperRightX, y: mainZoneCenterY },
        { x: lowerLeftX, y: layout1_LowerPairY },
        { x: lowerRightX, y: layout1_LowerPairY },
      ];
    } else {
      // Define the 4 fixed positions for this view
      nodePositions = [
        { x: upperLeftX, y: layout1_UpperPairY },
        { x: upperRightX, y: layout1_UpperPairY },
        { x: lowerLeftX, y: layout1_LowerPairY },
        { x: lowerRightX, y: layout1_LowerPairY },
      ];
    }
  }

  // Map the selected devices to the calculated positions
  currentNodes = nodePositions.map((pos, i) => {
    const device = currentDevices[i] || null;
    return {
      id: device ? device.hostname : "None",
      shortName: device ? device.shortName : undefined,
      x: pos.x,
      y: pos.y,
    };
  });

  // --- Filter the real links and map to D3 format ---
  const visibleNodeIds = new Set();
  const nodeMap = new Map();

  currentNodes.forEach((node) => {
    if (node.id !== "None") {
      visibleNodeIds.add(node.id);
      nodeMap.set(node.id, node);
      const clean = cleanDeviceKey(node.id);
      if (clean) {
        visibleNodeIds.add(clean);
        if (!nodeMap.has(clean)) nodeMap.set(clean, node);
      }
    }
  });

  const getEndpointKey = (endpoint) => {
    if (!endpoint) return "";
    if (typeof endpoint === "object") {
      return endpoint.hostname || endpoint.name || endpoint.id || "";
    }
    return String(endpoint);
  };

  const visibleLinks = allLinksForChart.filter((link) => {
    const sKey = getEndpointKey(link.source);
    const tKey = getEndpointKey(link.target);
    const hasSource = visibleNodeIds.has(sKey) || visibleNodeIds.has(cleanDeviceKey(sKey));
    const hasTarget = visibleNodeIds.has(tKey) || visibleNodeIds.has(cleanDeviceKey(tKey));
    return hasSource && hasTarget;
  });

  const finalLinks = visibleLinks
    .map((link) => {
      const sKey = getEndpointKey(link.source);
      const tKey = getEndpointKey(link.target);
      const sourceNode = nodeMap.get(sKey) || nodeMap.get(cleanDeviceKey(sKey));
      const targetNode = nodeMap.get(tKey) || nodeMap.get(cleanDeviceKey(tKey));
      return {
        ...link,
        source: sourceNode,
        target: targetNode,
      };
    })
    .filter((link) => link.source && link.target);

  return {
    nodes: currentNodes,
    links: finalLinks, // <-- Return the filtered and mapped real links
    centerX: centerX,
    centerY: mainZoneCenterY,
  };
}
