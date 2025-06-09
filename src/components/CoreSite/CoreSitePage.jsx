// CoreSitePage.jsx
import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import { useParams, useMatch } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout"; // Adjust path
import CoreSiteCanvas from "./CoreSiteCanvas"; // Adjust path
import SitesBar from "./SitesBar"; // Adjust path

export default function CoreSitePage({ theme = "dark" }) {
  // Added theme prop with a default
  const { zoneId } = useParams();
  const containerRef = useRef(null);
  const svgRef = useRef();
  const siteRefs = useRef([]);
  const node4Ref = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const isLZoneMatch = useMatch("l-zone/:zoneId");
  const isPZoneMatch = useMatch("p-zone/:zoneId");

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

  const { nodes, links, centerX, centerY } = useNodeLayout(
    dimensions.width,
    dimensions.height
  );

  useEffect(() => {
    console.log(
      `[CoreSitePage] Effect for data fetching. Zone ID: ${zoneId}, Network Type: ${networkType}, Dimensions: ${dimensions.width}x${dimensions.height}, Theme: ${theme}`
    );
    // Add logic here if data fetching depends on theme
  }, [zoneId, networkType, dimensions, theme]); // Added theme to dependencies

  // Theme-dependent Tailwind classes
  const pageBgColor = theme === "dark" ? "bg-slate-900" : "bg-white";
  const loadingBgColor = theme === "dark" ? "bg-slate-800" : "bg-gray-100";
  const loadingTextColor = theme === "dark" ? "text-white" : "text-gray-700";
  const infoBoxBg =
    theme === "dark"
      ? "bg-black bg-opacity-50"
      : "bg-gray-100 bg-opacity-80 border border-gray-300";
  const infoBoxText = theme === "dark" ? "text-white" : "text-gray-700";

  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div
        ref={containerRef}
        className={`w-full h-full ${loadingBgColor} ${loadingTextColor} flex items-center justify-center`}
      >
        Loading dimensions...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${pageBgColor} overflow-hidden`}
    >
      <div
        className={`absolute top-2 left-2 ${infoBoxBg} ${infoBoxText} p-1.5 text-xs rounded shadow-md z-20`}
      >
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
        currentZoneId={zoneId} // Pass zoneId to potentially display it in the canvas
        currentNetworkType={networkType}
        theme={theme} // Pass theme down
      />
      <SitesBar
        svgRef={svgRef}
        node4Ref={node4Ref}
        siteRefs={siteRefs}
        theme={theme} // Pass theme down
      />
    </div>
  );
}
