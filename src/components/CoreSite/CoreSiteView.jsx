// src/components/CoreSite/CoreSiteView.jsx
import React, { useRef } from "react";
import CoreSiteCanvas from "./CoreSiteCanvas";
import SitesBar from "./SitesBar";
import SiteDetailPopup from "./SiteDetailPopup";
import CoreSiteControls from "./CoreSiteControls"; // Import the new component

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
  dimensions,
  nodes,
  links,
  centerX,
  centerY,
  selectedNodeId,
  setSelectedNodeId, // Keep this to pass to the handler
  openPopups,
  onSiteClick,
  onLinkClick,
  onClosePopup,
  onBackToChart,
  getPopupPositioning,
}) {
  const svgRef = useRef(null);
  const siteRefs = useRef([]);
  const focusedNodeDataRef = useRef(null);

  const pageBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const loadingBgColor = theme === "dark" ? "bg-slate-800" : "bg-gray-100";
  const loadingTextColor = theme === "dark" ? "text-white" : "text-gray-700";
  const backButtonBg =
    theme === "dark"
      ? "bg-transparent hover:bg-gray-700"
      : "bg-transparent hover:bg-gray-100";
  const backButtonText = theme === "dark" ? "text-white" : "text-gray-800";

  // This specific calculation might move into CoreSiteControls or be passed if needed
  // const controlsGroupTop = centerY - 250;

  const handleToggleSwitch = () => {
    setSelectedNodeId(selectedNodeId === "Node 4" ? "Node 3" : "Node 4");
  };

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

  const node4Text = "Node 4 (80 Sites)";
  const node3Text = "Node 3 (30 Sites)";
  const displayZoneId = zoneId ? `Zone ${zoneId}` : "Central Zone";

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${pageBgColor} overflow-hidden`}
    >
      {/* Header Area for Back Button */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center px-4 z-30 pointer-events-none">
        <div className="flex-none pointer-events-auto">
          <button
            onClick={onBackToChart}
            className={`px-3 py-1.5 rounded-md text-sm font-medium 
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
            <BackArrowIcon />
            Back
          </button>
        </div>
      </div>

      {/* Use the new CoreSiteControls component */}
      <CoreSiteControls
        theme={theme}
        centerX={centerX}
        centerY={centerY}
        displayZoneId={displayZoneId}
        selectedNodeId={selectedNodeId}
        onToggleSwitch={handleToggleSwitch} // Pass the handler
        node4Text={node4Text}
        node3Text={node3Text}
        // controlsGroupTop={controlsGroupTop} // Pass if calculated here and needed by child
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
          const {
            topPosition,
            popupRightOffsetPx,
            zIndex,
            isEffectivelyOpen,
            maxWidthVh,
            popupWidthPx,
          } = getPopupPositioning(index, openPopups.length);

          return (
            <SiteDetailPopup
              key={popup.instanceId}
              isOpen={popup.isOpen && isEffectivelyOpen}
              onClose={() => onClosePopup(popup.instanceId)}
              detailData={popup.detailData}
              topPosition={topPosition}
              popupRightOffsetPx={popupRightOffsetPx}
              zIndex={zIndex}
              maxWidthVh={maxWidthVh}
              popupWidthPx={popupWidthPx}
            />
          );
        })}
      </div>
    </div>
  );
}
