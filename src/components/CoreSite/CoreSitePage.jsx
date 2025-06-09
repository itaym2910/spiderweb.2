// src/components/CoreSite/CoreSitePage.jsx
import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout"; // Ensure this path is correct
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
const POPUP_MAX_HEIGHT_VH = 48;
const POPUP_WIDTH_PX = 384;
const POPUP_RIGHT_OFFSET_PX = 20; // Right offset for the primary (first opened) popup
const POPUP_INITIAL_TOP_PX = 20; // Top offset for the primary (first opened) popup

// How much each SUBSEQUENT popup (2nd, 3rd, etc.) is offset from the one "in front" of it
const STACK_OFFSET_Y_PX = 20; // How much each subsequent popup is shifted down
const STACK_OFFSET_X_PX = 0; // Set to 0 for vertical alignment, >0 for left shift
const MAX_DEPTH_FOR_OFFSET_STACKING = 3; // Max number of popups to show distinct stacking offsets

export default function CoreSitePage({ theme = "dark" }) {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const siteRefs = useRef([]);
  const node4Ref = useRef(null); // Ref for "Node 4" or your central node

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [openPopups, setOpenPopups] = useState([]);
  const [nextPopupInstanceId, setNextPopupInstanceId] = useState(0);
  const [activatedPopupIds, setActivatedPopupIds] = useState(new Set());

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

  const handleSiteClick = (siteIndex, siteName) => {
    const existingPopup = openPopups.find((p) => p.siteData.id === siteIndex);
    if (existingPopup) {
      if (
        !existingPopup.isOpen &&
        !activatedPopupIds.has(existingPopup.instanceId)
      ) {
        // If it exists but is marked for closing or not yet activated, re-activate
        setActivatedPopupIds((prev) =>
          new Set(prev).add(existingPopup.instanceId)
        );
      }
      return;
    }

    const newPopupData = {
      id: siteIndex, // siteIndex should be unique for each site button
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
    const newInstanceId = nextPopupInstanceId;

    setOpenPopups((prevPopups) => [
      ...prevPopups,
      {
        instanceId: newInstanceId,
        siteData: newPopupData,
        isOpen: false, // Add new popups with isOpen: false initially
      },
    ]);
    setActivatedPopupIds((prev) => new Set(prev).add(newInstanceId));
    setNextPopupInstanceId((prevId) => prevId + 1);
  };

  useEffect(() => {
    if (activatedPopupIds.size > 0) {
      const timerId = setTimeout(() => {
        setOpenPopups((currentPopups) =>
          currentPopups.map((p) => {
            if (activatedPopupIds.has(p.instanceId)) {
              return { ...p, isOpen: true };
            }
            return p;
          })
        );
        setActivatedPopupIds(new Set());
      }, 10); // Small delay (e.g., 10-50ms) can be more robust for browser rendering cycle
      return () => clearTimeout(timerId);
    }
  }, [activatedPopupIds]);

  const handleClosePopup = (instanceIdToClose) => {
    setOpenPopups((prevPopups) =>
      prevPopups.map((p) =>
        p.instanceId === instanceIdToClose ? { ...p, isOpen: false } : p
      )
    );
    setActivatedPopupIds((prev) => {
      const next = new Set(prev);
      next.delete(instanceIdToClose);
      return next;
    });
    setTimeout(() => {
      setOpenPopups((prevPopups) =>
        prevPopups.filter((p) => p.instanceId !== instanceIdToClose)
      );
    }, 300); // Match SiteDetailPopup animation duration
  };

  const handleBackToChart = () => navigate("..");
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
        className={`absolute top-0 left-10 z-30 px-3 py-1.5 rounded-md text-sm font-medium 
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
        Back
      </button>

      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <CoreSiteCanvas
        svgRef={svgRef}
        node4Ref={node4Ref} // Make sure CoreSiteCanvas uses this to find the central node
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
        node4Ref={node4Ref} // Pass node4Ref to SitesBar
        siteRefs={siteRefs}
        theme={theme}
        onSiteClick={handleSiteClick}
      />

      {/* Popup Container */}
      <div className="fixed right-0 top-0 h-full pointer-events-none z-20">
        {openPopups.map((popup, index) => {
          const stackDepth = index;
          const stackDepthForOffset = Math.min(
            stackDepth,
            MAX_DEPTH_FOR_OFFSET_STACKING - 1
          );

          const topPos =
            POPUP_INITIAL_TOP_PX + stackDepthForOffset * STACK_OFFSET_Y_PX;
          const rightPos =
            POPUP_RIGHT_OFFSET_PX + stackDepthForOffset * STACK_OFFSET_X_PX;
          const currentZIndex = 100 + (openPopups.length - stackDepth);

          const isVisiblyStacked = stackDepth < MAX_DEPTH_FOR_OFFSET_STACKING;
          const finalIsOpenState = popup.isOpen && isVisiblyStacked;

          let finalTopPos = topPos;
          let finalRightPos = rightPos;
          if (!isVisiblyStacked && popup.isOpen) {
            finalTopPos =
              POPUP_INITIAL_TOP_PX +
              (MAX_DEPTH_FOR_OFFSET_STACKING - 1) * STACK_OFFSET_Y_PX;
            finalRightPos =
              POPUP_RIGHT_OFFSET_PX +
              (MAX_DEPTH_FOR_OFFSET_STACKING - 1) * STACK_OFFSET_X_PX;
          }

          return (
            <SiteDetailPopup
              key={popup.instanceId}
              isOpen={finalIsOpenState}
              onClose={() => handleClosePopup(popup.instanceId)}
              siteData={popup.siteData}
              topPosition={finalTopPos}
              popupRightOffsetPx={finalRightPos}
              zIndex={currentZIndex}
              maxWidthVh={POPUP_MAX_HEIGHT_VH}
              popupWidthPx={POPUP_WIDTH_PX}
              // Removed theme prop as SiteDetailPopup gets it from documentElement
            />
          );
        })}
      </div>
    </div>
  );
}
