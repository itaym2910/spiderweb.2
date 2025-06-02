// components/SquareZonePage.jsx
import React, { useRef } from "react";
import { useNodeLayout } from "./useNodeLayout";
import ZoneCanvas from "./ZoneCanvas";
import ButtonBar from "./ButtonBar";

export default function SquareZonePage() {
  const svgRef = useRef();
  const buttonRefs = useRef([]);
  const node4Ref = useRef(null);

  const { nodes, links, centerX, centerY } = useNodeLayout(
    window.innerWidth,
    window.innerHeight
  );

  return (
    <div className="relative w-screen h-screen bg-slate-900 overflow-hidden">
      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <ZoneCanvas
        svgRef={svgRef}
        node4Ref={node4Ref}
        nodes={nodes}
        links={links}
        centerX={centerX}
        centerY={centerY}
      />
      <ButtonBar svgRef={svgRef} node4Ref={node4Ref} buttonRefs={buttonRefs} />
    </div>
  );
}
