// src/components/CoreSite/CoreSiteView.jsx
import React, { useRef } from "react";
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

export default function CoreSiteView({
  theme,
  zoneId,
  containerRef, // Received from hook/parent
  dimensions,
  nodes,
  links,
  centerX,
  centerY,
  openPopups,
  onSiteClick,
  onLinkClick,
  onClosePopup,
  onBackToChart,
  getPopupPositioning,
}) {
  const svgRef = useRef(null);
  const siteRefs = useRef([]); // If SitesBar needs individual refs to site elements
  const node4Ref = useRef(null); // If CoreSiteCanvas or SitesBar need this

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
        ref={containerRef} // Assign the ref here
        className={`w-full h-full ${loadingBgColor} ${loadingTextColor} flex items-center justify-center`}
      >
        Loading dimensions...
      </div>
    );
  }

  return (
    <div
      ref={containerRef} // Assign the ref here
      className={`relative w-full h-full ${pageBgColor} overflow-hidden`}
    >
      <button
        onClick={onBackToChart}
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
        <BackArrowIcon /> {/* Assuming you want the icon here */}
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
        onLinkClick={onLinkClick}
      />
      <SitesBar
        svgRef={svgRef}
        node4Ref={node4Ref}
        siteRefs={siteRefs}
        theme={theme}
        onSiteClick={onSiteClick}
        // Pass nodes if SitesBar needs them to render sites, e.g., for positioning
        nodes={nodes}
      />

      <div className="fixed right-0 top-0 h-full pointer-events-none z-20">
        {openPopups.map((popup, index) => {
          const {
            topPosition,
            popupRightOffsetPx,
            zIndex,
            isEffectivelyOpen, // Use this to control the visual open state
            maxWidthVh,
            popupWidthPx,
          } = getPopupPositioning(index, openPopups.length);

          return (
            <SiteDetailPopup
              key={popup.instanceId}
              isOpen={popup.isOpen && isEffectivelyOpen} // Popup is open AND it's within visible stack
              onClose={() => onClosePopup(popup.instanceId)}
              detailData={popup.detailData}
              topPosition={topPosition}
              popupRightOffsetPx={popupRightOffsetPx}
              zIndex={zIndex}
              maxWidthVh={maxWidthVh}
              popupWidthPx={popupWidthPx}
              // theme={theme} // SiteDetailPopup manages its own theme based on HTML class
            />
          );
        })}
      </div>
    </div>
  );
}
