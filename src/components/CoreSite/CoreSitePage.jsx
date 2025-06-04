// CoreSitePage.jsx
import React, { useRef, useState, useLayoutEffect } from "react"; // Added useState, useLayoutEffect
import { useParams } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout"; // Adjust path
import CoreSiteCanvas from "./CoreSiteCanvas"; // Adjust path
import SitesBar from "./SitesBar"; // Adjust path

export default function CoreSitePage() {
  const { zoneId } = useParams(); // Good to have for context if needed
  const containerRef = useRef(null); // Ref for the main container div
  const svgRef = useRef();
  const siteRefs = useRef([]);
  const node4Ref = useRef(null);

  // State to hold the actual dimensions of the container
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Get dimensions of the containerRef once it's mounted and when it resizes
  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions(); // Initial dimensions
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Use the actual dimensions for the layout
  // Only calculate layout if dimensions are available
  const { nodes, links, centerX, centerY } = useNodeLayout(
    dimensions.width,
    dimensions.height
  );

  console.log(
    "[CoreSitePage] Rendering for zone:",
    zoneId,
    "Dimensions:",
    dimensions
  );

  // If dimensions are not yet set, you might want to render a loader or nothing
  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div ref={containerRef} className="w-full h-full">
        Loading dimensions...
      </div>
    ); // Ensure this div also takes up space
  }

  return (
    // This div should now fill its parent (the h-[770px] container from DashboardPage)
    // It also acts as the reference for getting dimensions.
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 overflow-hidden"
    >
      {/* SVG will be sized by CoreSiteCanvas based on these new dimensions */}
      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <CoreSiteCanvas
        svgRef={svgRef}
        node4Ref={node4Ref}
        nodes={nodes}
        links={links}
        centerX={centerX} // Will be based on actual container width
        centerY={centerY} // Will be based on actual container height
        // Pass dimensions to CoreSiteCanvas so it can size the SVG attributes
        width={dimensions.width}
        height={dimensions.height}
      />
      {/* SitesBar might also need adjustment if its positioning depends on full screen */}
      <SitesBar svgRef={svgRef} node4Ref={node4Ref} siteRefs={siteRefs} />
    </div>
  );
}
