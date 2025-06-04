import React, { useRef } from "react";
import { useNodeLayout } from "./useNodeLayout";
import CoreSiteCanvas from "./CoreSiteCanvas";
import SitesBar from "./SitesBar";

export default function CoreSitePage() {
  const svgRef = useRef();
  const siteRefs = useRef([]);
  const node4Ref = useRef(null);

  const { nodes, links, centerX, centerY } = useNodeLayout(
    window.innerWidth,
    window.innerHeight
  );

  return (
    <div className="relative w-screen h-screen bg-slate-900 overflow-hidden">
      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <CoreSiteCanvas
        svgRef={svgRef}
        node4Ref={node4Ref}
        nodes={nodes}
        links={links}
        centerX={centerX}
        centerY={centerY}
      />
      <SitesBar svgRef={svgRef} node4Ref={node4Ref} siteRefs={siteRefs} />
    </div>
  );
}
