// src/components/CoreSite/CoreSiteView.jsx
import React, { useRef } from "react";
import CoreSiteCanvas from "./CoreSiteCanvas";
import SitesBar from "./SitesBar";
import SiteDetailPopup from "./SiteDetailPopup";

const BackArrowIcon = ({ className = "w-5 h-5" }) => (
  // ... (icon code)
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
  zoneId, // This is the currentZoneId from useParams()
  containerRef,
  dimensions,
  nodes,
  links,
  centerX,
  centerY,
  selectedNodeId,
  setSelectedNodeId,
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

  const toggleTrackBg = theme === "dark" ? "bg-gray-700" : "bg-gray-200";
  const toggleThumbBg = theme === "dark" ? "bg-sky-600" : "bg-sky-500";
  const toggleThumbText = theme === "dark" ? "text-white" : "text-white";
  const toggleTrackText = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const zoneTitleColor = theme === "dark" ? "text-white" : "text-sky-800";

  // The D3 circle is at cy: centerY. The D3 text was at centerY - 200.
  // Let's position our new HTML zone label and toggle switch group relative to that.
  // If the toggle switch height is ~36px (h-9), and zone label ~24px + margin ~8px = 32px. Total ~68px.
  // To place this group somewhat above where the D3 text was (centerY - 200),
  // a top position for the group could be around centerY - 200 - (68/2) - some_offset
  // Let's try:
  const controlsGroupTop = centerY - 250; // Top of the entire (Zone Label + Toggle) group

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

  const isNode4Selected = selectedNodeId === "Node 4";
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
        {/* ... (back button code) ... */}
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

      {/* Zone Label and Toggle Switch Group */}
      {centerX > 0 && centerY > 0 && (
        <div
          className="absolute flex flex-col items-center z-30"
          style={{
            left: `${centerX}px`,
            top: `${controlsGroupTop}px`, // Use the new top for the group
            transform: "translateX(-50%)",
          }}
        >
          {/* Zone Name Label */}
          <div className={`mb-2 text-lg font-bold ${zoneTitleColor}`}>
            {displayZoneId}
          </div>

          {/* Toggle Switch for Node Selection */}
          <button
            type="button"
            onClick={handleToggleSwitch}
            className={`relative inline-flex items-center h-9 rounded-full w-auto min-w-[300px] p-1
                        transition-colors duration-200 ease-in-out cursor-pointer group
                        focus:outline-none focus:ring-2 focus:ring-offset-2 
                        ${
                          theme === "dark"
                            ? "focus:ring-offset-gray-800"
                            : "focus:ring-offset-white"
                        }
                        ${
                          theme === "dark"
                            ? "focus:ring-sky-500"
                            : "focus:ring-sky-600"
                        }
                        ${toggleTrackBg}`}
            role="switch"
            aria-checked={isNode4Selected}
          >
            <span className="sr-only">Select Focused Node</span>
            <div className="absolute inset-0 flex items-center justify-around w-full px-1">
              <span className={`text-xs font-medium ${toggleTrackText}`}>
                {node4Text}
              </span>
              <span className={`text-xs font-medium ${toggleTrackText}`}>
                {node3Text}
              </span>
            </div>
            <span
              aria-hidden="true"
              className={`pointer-events-none relative inline-flex items-center justify-center 
                          h-7 w-[calc(50%-4px)] rounded-full 
                          ${toggleThumbBg} shadow-md ring-0 
                          transform transition-transform duration-200 ease-in-out`}
              style={{
                transform: isNode4Selected
                  ? "translateX(0%)"
                  : "translateX(calc(100% + 4px))",
              }}
            >
              <span className={`text-xs font-medium ${toggleThumbText}`}>
                {isNode4Selected ? node4Text : node3Text}
              </span>
            </span>
          </button>
        </div>
      )}

      {/* ... (rest of the component: SVG, SitesBar, Popups) ... */}
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
        currentZoneId={zoneId} // Pass currentZoneId (renamed from zoneId in props to avoid conflict)
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
