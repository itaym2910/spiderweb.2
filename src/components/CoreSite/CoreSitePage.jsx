// CoreSitePage.jsx
import React, { useRef, useState, useLayoutEffect, useEffect } from "react"; // Added useEffect
import { useParams, useMatch } from "react-router-dom"; // useMatch is already here
import { useNodeLayout } from "./useNodeLayout"; // Adjust path
import CoreSiteCanvas from "./CoreSiteCanvas"; // Adjust path
import SitesBar from "./SitesBar"; // Adjust path

export default function CoreSitePage() {
  const { zoneId } = useParams();
  const containerRef = useRef(null);
  const svgRef = useRef();
  const siteRefs = useRef([]);
  const node4Ref = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Determine network type based on the route
  // Assuming your routes in DashboardPage are now "/l-zone/:zoneId" and "/p-zone/:zoneId"
  // And that DashboardPage itself is rendered at a path that allows these relative paths.
  // For example, if DashboardPage is at "/", these will be matched directly.
  // If DashboardPage is at "/dashboard", then the full paths would be "/dashboard/l-zone/:zoneId", etc.
  // useMatch will match against the full current URL.
  // For this to work correctly with nested routes, ensure the path passed to useMatch is relative
  // to the <Routes> block where CoreSitePage is defined, or use absolute paths.
  // Given our setup, relative paths from the parent <Routes> in DashboardPage are fine.

  // Let's assume the parent <Routes> in DashboardPage handles the base path.
  // So, we match against the specific part of the path.
  const isLZoneMatch = useMatch("l-zone/:zoneId"); // Matches if current path segment is l-zone/:zoneId
  const isPZoneMatch = useMatch("p-zone/:zoneId"); // Matches if current path segment is p-zone/:zoneId

  let networkType = "unknown";
  if (isLZoneMatch) {
    networkType = "L-Network";
  } else if (isPZoneMatch) {
    networkType = "P-Network";
  }

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // useNodeLayout might eventually need to know the networkType if L and P networks have different layout logic
  // For now, it only uses dimensions.
  const { nodes, links, centerX, centerY } = useNodeLayout(
    dimensions.width,
    dimensions.height
    // networkType // You could pass networkType here if useNodeLayout needs it
  );

  // Example of how you might use networkType and zoneId for fetching data
  useEffect(() => {
    console.log(
      `[CoreSitePage] Effect for data fetching. Zone ID: ${zoneId}, Network Type: ${networkType}, Dimensions: ${dimensions.width}x${dimensions.height}`
    );
    if (zoneId && networkType !== "unknown" && dimensions.width > 0) {
      // Example: fetchData(zoneId, networkType).then(setDataForCanvas);
      // For now, useNodeLayout is providing static data based on dimensions.
      // If useNodeLayout were to fetch or generate data based on networkType,
      // you'd trigger that here or pass networkType to it.
    }
  }, [zoneId, networkType, dimensions]); // Re-run if these change

  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full bg-slate-800 text-white flex items-center justify-center"
      >
        Loading dimensions...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 overflow-hidden"
    >
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-1 text-xs rounded z-20">
        Displaying: {networkType} - Zone: {zoneId}
      </div>
      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <CoreSiteCanvas
        svgRef={svgRef}
        node4Ref={node4Ref}
        nodes={nodes}
        links={links}
        centerX={centerX}
        centerY={centerY}
        width={dimensions.width}
        height={dimensions.height}
        // You could also pass networkType or zoneId to CoreSiteCanvas if it needs to alter rendering
        // e.g., to display the zone name or change zone circle appearance.
        // For now, CoreSiteCanvas has a hardcoded "Zone A" label.
        currentZoneId={zoneId}
        currentNetworkType={networkType}
      />
      <SitesBar svgRef={svgRef} node4Ref={node4Ref} siteRefs={siteRefs} />
    </div>
  );
}
