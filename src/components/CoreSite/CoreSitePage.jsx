// src/components/CoreSite/CoreSitePage.jsx
import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import { useParams, useMatch, useNavigate } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout";
import CoreSiteCanvas from "./CoreSiteCanvas";
import SitesBar from "./SitesBar";
import SiteDetailPopup from "./SiteDetailPopup";

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

// --- Constants for Popup Stacking ---
const POPUP_MAX_HEIGHT_VH = 48; // Max height of one popup as % of viewport height
const POPUP_WIDTH_PX = 384; // Corresponds to md:w-96
const POPUP_RIGHT_OFFSET_PX = 20;
const POPUP_SPACING_PX = 16; // Vertical space between popups
const POPUP_INITIAL_TOP_PX = 20; // Margin from viewport top for the first popup
// --- End Constants ---

export default function CoreSitePage({ theme = "dark" }) {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const svgRef = useRef();
  const siteRefs = useRef([]);
  const node4Ref = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // --- MODIFIED STATE FOR MULTIPLE POPUPS ---
  const [openPopups, setOpenPopups] = useState([]); // Array of popup objects
  const [nextPopupInstanceId, setNextPopupInstanceId] = useState(0); // For unique keys
  // --- END MODIFIED STATE ---

  const isLZoneMatch = useMatch("/l-zone/:zoneId");
  const isPZoneMatch = useMatch("/p-zone/:zoneId");

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

  // --- MODIFIED HANDLERS FOR MULTIPLE POPUPS ---
  const handleSiteClick = (siteIndex, siteName) => {
    const newPopupData = {
      // siteData fields
      id: siteIndex, // This is the site's own ID from the bar
      name: siteName,
      linkStatus: Math.random() > 0.3 ? "Up" : "Down",
      protocolStatus: Math.random() > 0.2 ? "Active" : "Inactive",
      bandwidth: `${Math.floor(Math.random() * 90) + 10} Mbps`,
      mpls: Math.random() > 0.5 ? "Enabled" : "Disabled",
      cvc: `VLAN-${Math.floor(Math.random() * 1000) + 100}`,
      tx: `${(Math.random() * 100).toFixed(2)} Mbps`,
      rx: `${(Math.random() * 100).toFixed(2)} Mbps`,
      interfaceType: Math.random() > 0.5 ? "Ethernet" : "Fiber",
      duplexMode: Math.random() > 0.3 ? "Full" : "Half",
      speed: Math.random() > 0.6 ? "1 Gbps" : "100 Mbps",
      errorRate: `${(Math.random() * 0.1).toFixed(4)}%`,
      mtu: Math.random() > 0.5 ? 1500 : 9000,
      adminStatus: Math.random() > 0.2 ? "Up" : "Down (administratively)",
      utilization: `${Math.floor(Math.random() * 100)}%`,
      jitter: `${Math.floor(Math.random() * 20)} ms`,
    };

    setOpenPopups((prevPopups) => [
      ...prevPopups,
      {
        instanceId: nextPopupInstanceId, // Unique ID for this popup instance
        siteData: newPopupData,
        isOpen: true, // Mark as initially open for animation
      },
    ]);
    setNextPopupInstanceId((prevId) => prevId + 1);
  };

  const handleClosePopup = (instanceIdToClose) => {
    setOpenPopups((prevPopups) =>
      prevPopups.map((p) =>
        p.instanceId === instanceIdToClose ? { ...p, isOpen: false } : p
      )
    );
    // Remove from array after animation (optional, for smoother UX)
    setTimeout(() => {
      setOpenPopups((prevPopups) =>
        prevPopups.filter((p) => p.instanceId !== instanceIdToClose)
      );
    }, 300); // Match animation duration
  };
  // --- END MODIFIED HANDLERS ---

  const handleBackToChart = () => {
    if (openPopups.length > 0) {
      // Close all popups or just navigate? For now, just navigate.
      // Or setOpenPopups([]);
    }
    navigate("..");
  };

  const pageBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const loadingBgColor = theme === "dark" ? "bg-slate-800" : "bg-gray-100";
  const loadingTextColor = theme === "dark" ? "text-white" : "text-gray-700";

  const backButtonBg =
    theme === "dark"
      ? "bg-transparent hover:bg-gray-700"
      : "bg-transparent hover:bg-gray-100";
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
      <button
        onClick={handleBackToChart}
        className={`absolute top-3 left-3 z-20 px-3 py-1.5 rounded-md text-sm font-medium 
                    flex items-center gap-1.5
                    ${backButtonBg} ${backButtonText}
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    ${
                      theme === "dark"
                        ? "focus:ring-blue-500 focus:ring-offset-gray-800"
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
        theme={theme}
      />
      <SitesBar
        svgRef={svgRef}
        node4Ref={node4Ref}
        siteRefs={siteRefs}
        theme={theme}
        onSiteClick={handleSiteClick}
      />

      {/* --- RENDER MULTIPLE POPUPS --- */}
      <div className="fixed right-0 top-0 h-full pointer-events-none">
        {" "}
        {/* Container for popups, adjust if needed */}
        {openPopups.map((popup, index) => {
          // Calculate approximate height of one popup in pixels
          const popupApproxHeightPx =
            (POPUP_MAX_HEIGHT_VH / 100) * dimensions.height;
          const topPosition =
            POPUP_INITIAL_TOP_PX +
            index * (popupApproxHeightPx + POPUP_SPACING_PX);

          return (
            <SiteDetailPopup
              key={popup.instanceId}
              isOpen={popup.isOpen} // Used for animation
              onClose={() => handleClosePopup(popup.instanceId)}
              siteData={popup.siteData}
              theme={theme}
              // --- Pass styling props for stacking ---
              topPosition={topPosition}
              zIndex={100 + openPopups.length - index} // Higher index (later popup) gets higher z-index
              maxWidthVh={POPUP_MAX_HEIGHT_VH}
              popupWidthPx={POPUP_WIDTH_PX}
              popupRightOffsetPx={POPUP_RIGHT_OFFSET_PX}
            />
          );
        })}
      </div>
      {/* --- END RENDER MULTIPLE POPUPS --- */}
    </div>
  );
}
