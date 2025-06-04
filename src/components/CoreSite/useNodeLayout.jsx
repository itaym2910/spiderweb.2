export function useNodeLayout(width, height) {
  const centerX = width / 2;
  const centerY = height / 3;
  const spacing = 100;

  const nodes = [
    { id: "Node 1", x: centerX - spacing, y: centerY - spacing },
    { id: "Node 2", x: centerX + spacing, y: centerY - spacing },
    { id: "Node 3", x: centerX + spacing, y: centerY + spacing },
    { id: "Node 4", x: centerX - spacing, y: centerY + spacing },
  ];

  const links = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      links.push({ id: `link-${i}-${j}`, source: nodes[i], target: nodes[j] });
    }
  }

  return { nodes, links, centerX, centerY };
}
