// src/components/CoreSite/CoreSiteView.jsx
import React, { useRef } from "react";
import CoreSiteCanvas from "./CoreSiteCanvas";
import SitesBar from "./SitesBar";
import SiteDetailPopup from "./SiteDetailPopup";
import CoreSiteControls from "./CoreSiteControls";

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
  containerRef,
  dimensions, // dimensions.height will be used
  nodes,
  links,
  centerX,
  centerY,
  selectedNodeId,
  onMainToggleSwitch,
  openPopups,
  onSiteClick,
  onLinkClick,
  onClosePopup,
  onBackToChart,
  getPopupPositioning, // This function is from usePopupManager
  showExtendedNodes,
  onToggleExtendedNodes,
  mainToggleNode1Text,
  mainToggleNode2Text,
}) {
  const svgRef = useRef(null);
  const siteRefs = useRef([]);
  const focusedNodeDataRef = useRef(null);

  const pageBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const loadingBgColor = theme === "dark" ? "bg-slate-800" : "bg-gray-100";
  const loadingTextColor = theme === "dark" ? "text-white" : "text-gray-700";
  const backButtonBg =
    theme === "dark"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-blue-500 hover:bg-blue-600";
  const backButtonText = "text-white";
  const backButtonFocusRing =
    theme === "dark"
      ? "focus:ring-blue-400 focus:ring-offset-gray-800"
      : "focus:ring-blue-500 focus:ring-offset-white";

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

  const displayZoneId = zoneId
    ? zoneId.startsWith("Zone ")
      ? zoneId
      : `Zone ${zoneId}`
    : "Central Zone";

  const controlsAreaHalfWidth = 320 / 2;
  const backButtonWidth = 140;
  const gap = 16;
  const backButtonLeftPos = `calc(50% - ${controlsAreaHalfWidth}px - ${backButtonWidth}px - ${gap}px)`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${pageBgColor} overflow-hidden`}
    >
      <div
        className="absolute z-30 pointer-events-none"
        style={{
          top: "1rem",
          left: backButtonLeftPos,
          height: "2.25rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="flex-none pointer-events-auto">
          <button
            onClick={onBackToChart}
            className={`px-4 py-2 rounded-md text-sm font-semibold shadow-sm
                        flex items-center gap-1.5
                        ${backButtonBg} ${backButtonText}
                        focus:outline-none focus:ring-2 focus:ring-offset-2 
                        ${backButtonFocusRing}`}
            title="Back to chart view"
          >
            <BackArrowIcon className="w-4 h-4" />
            Back to Chart
          </button>
        </div>
      </div>

      <CoreSiteControls
        theme={theme}
        displayZoneId={displayZoneId}
        selectedNodeId={selectedNodeId}
        onToggleSwitch={onMainToggleSwitch}
        mainToggleOption1Text={mainToggleNode1Text}
        mainToggleOption2Text={mainToggleNode2Text}
        zoneId={zoneId}
        showExtendedNodes={showExtendedNodes}
        onToggleExtendedNodes={onToggleExtendedNodes}
      />

      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <CoreSiteCanvas
        svgRef={svgRef}
        focusedNodeDataRef={focusedNodeDataRef}
        focusedNodeId={selectedNodeId}
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
        focusedNodeDataRef={focusedNodeDataRef}
        focusedNodeId={selectedNodeId}
        siteRefs={siteRefs}
        theme={theme}
        onSiteClick={onSiteClick}
      />

      <div className="fixed right-0 top-0 h-full pointer-events-none z-20">
        {openPopups.map((popup, index) => {
          // Pass dimensions.height to getPopupPositioning
          const {
            topPosition,
            popupRightOffsetPx,
            zIndex,
            isEffectivelyOpen,
            maxHeightPx, // Destructure maxHeightPx
            popupWidthPx,
          } = getPopupPositioning(index, openPopups.length, dimensions.height);

          return (
            <SiteDetailPopup
              key={popup.instanceId}
              isOpen={popup.isOpen && isEffectivelyOpen}
              onClose={() => onClosePopup(popup.instanceId)}
              detailData={popup.detailData}
              topPosition={topPosition}
              popupRightOffsetPx={popupRightOffsetPx}
              zIndex={zIndex}
              maxHeightPx={maxHeightPx} // Pass maxHeightPx
              popupWidthPx={popupWidthPx}
            />
          );
        })}
      </div>
    </div>
  );
}
