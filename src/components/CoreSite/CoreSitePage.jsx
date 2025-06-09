// src/components/CoreSite/CoreSitePage.jsx
import React, { useRef, useState, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout";
import CoreSiteCanvas from "./CoreSiteCanvas";
import SitesBar from "./SitesBar";
import SiteDetailPopup from "./SiteDetailPopup";

const BackArrowIcon = ({ className = "w-5 h-5" }) => (
  // ... (icon svg)
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

const POPUP_MAX_HEIGHT_VH = 40;
const POPUP_WIDTH_PX = 384;
const POPUP_RIGHT_OFFSET_PX = 20;
// const POPUP_SPACING_PX = 16; // REMOVE or set to 0
const POPUP_SPACING_PX = 0; // MODIFIED: Set to 0 to remove the gap
const POPUP_INITIAL_TOP_PX = 20;

export default function CoreSitePage({ theme = "dark" }) {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const svgRef = useRef();
  const siteRefs = useRef([]);
  const node4Ref = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [openPopups, setOpenPopups] = useState([]);
  const [nextPopupInstanceId, setNextPopupInstanceId] = useState(0);

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

  // useEffect(() => {}, [zoneId, networkType, dimensions, theme]); // This useEffect was empty

  const handleSiteClick = (siteIndex, siteName) => {
    const newPopupData = {
      id: siteIndex,
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
        instanceId: nextPopupInstanceId,
        siteData: newPopupData,
        isOpen: true,
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
    setTimeout(() => {
      setOpenPopups((prevPopups) =>
        prevPopups.filter((p) => p.instanceId !== instanceIdToClose)
      );
    }, 300);
  };

  const handleBackToChart = () => {
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

      <div className="fixed right-0 top-0 h-full pointer-events-none">
        {openPopups.map((popup, index) => {
          const popupApproxHeightPx =
            (POPUP_MAX_HEIGHT_VH / 100) * dimensions.height;

          // MODIFIED: POPUP_SPACING_PX is now 0, so it's effectively removed from the sum
          const topPosition =
            POPUP_INITIAL_TOP_PX +
            index * (popupApproxHeightPx + POPUP_SPACING_PX);

          return (
            <SiteDetailPopup
              key={popup.instanceId}
              isOpen={popup.isOpen}
              onClose={() => handleClosePopup(popup.instanceId)}
              siteData={popup.siteData}
              // theme prop is not used by SiteDetailPopup directly if it observes documentElement
              topPosition={topPosition}
              zIndex={100 + openPopups.length - index}
              maxWidthVh={POPUP_MAX_HEIGHT_VH}
              popupWidthPx={POPUP_WIDTH_PX}
              popupRightOffsetPx={POPUP_RIGHT_OFFSET_PX}
            />
          );
        })}
      </div>
    </div>
  );
}
