// CoreSitePage.jsx
import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import { useParams, useMatch, useNavigate } from "react-router-dom"; // Added useNavigate
import { useNodeLayout } from "./useNodeLayout";
import CoreSiteCanvas from "./CoreSiteCanvas";
import SitesBar from "./SitesBar";

// SVG Icon for Back Arrow (optional, you can use text "Back")
const BackArrowIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
);

export default function CoreSitePage({ theme = "dark" }) {
  const { zoneId } = useParams();
  const navigate = useNavigate(); // Hook for navigation
  const containerRef = useRef(null);
  const svgRef = useRef();
  const siteRefs = useRef([]);
  const node4Ref = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const isLZoneMatch = useMatch("/l-zone/:zoneId"); // More specific match
  const isPZoneMatch = useMatch("/p-zone/:zoneId"); // More specific match

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

  useEffect(() => {}, [zoneId, networkType, dimensions, theme]);

  const handleBackToChart = () => {
    navigate("..");
  };

  const pageBgColor = theme === "dark" ? "bg-slate-900" : "bg-white";
  const loadingBgColor = theme === "dark" ? "bg-slate-800" : "bg-gray-100";
  const loadingTextColor = theme === "dark" ? "text-white" : "text-gray-700";

  const backButtonBg =
    theme === "dark"
      ? "bg-gray-700 hover:bg-gray-600"
      : "bg-gray-200 hover:bg-gray-300";
  const backButtonText = theme === "dark" ? "text-white" : "text-gray-800";

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
      {/* Back Button */}
      <button
        onClick={handleBackToChart}
        className={`absolute top-3 left-3 z-20 px-3 py-1.5 rounded-md text-sm font-medium shadow-md
                    flex items-center gap-1.5
                    ${backButtonBg} ${backButtonText}
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    ${
                      theme === "dark"
                        ? "focus:ring-blue-500 focus:ring-offset-slate-900"
                        : "focus:ring-blue-500 focus:ring-offset-white"
                    }`}
        title="Back to chart view"
      >
        <BackArrowIcon className="w-4 h-4" />
        Back
      </button>

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
        currentZoneId={zoneId}
        currentNetworkType={networkType}
        theme={theme}
      />
      <SitesBar
        svgRef={svgRef}
        node4Ref={node4Ref}
        siteRefs={siteRefs}
        theme={theme}
      />
    </div>
  );
}
