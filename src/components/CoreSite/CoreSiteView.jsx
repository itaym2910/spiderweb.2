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
  containerRef,
  dimensions,
  nodes,
  links,
  centerX, // D3 center X
  centerY, // D3 center Y
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
  const controlButtonBg =
    theme === "dark"
      ? "bg-sky-600 hover:bg-sky-500"
      : "bg-sky-500 hover:bg-sky-400";
  const controlButtonActiveBg =
    theme === "dark"
      ? "bg-amber-500 hover:bg-amber-400"
      : "bg-amber-400 hover:bg-amber-300";

  // The D3 "Central Zone" text is at y: centerY - 200.
  // A single button is roughly 40px high.
  // We want the bottom of the buttons to be roughly above the text.
  // Let's place the top of the button container slightly higher than the zone text.
  // If the text's visual top is around centerY - 218,
  // placing the buttons' top at centerY - 250 or centerY - 260 should work.
  const focusButtonContainerTop = centerY - 260; // Adjust this value as needed

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

      {/* Side-by-side Focus Node Buttons, aligned with D3 Zone */}
      {centerX > 0 && centerY > 0 && (
        <div
          className="absolute flex flex-row items-center gap-2 z-30" // Changed to flex-row
          style={{
            left: `${centerX}px`,
            top: `${focusButtonContainerTop}px`,
            transform: "translateX(-50%)", // Horizontally center the block
          }}
        >
          <button
            onClick={() => setSelectedNodeId("Node 4")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium text-white
                        ${
                          selectedNodeId === "Node 4"
                            ? controlButtonActiveBg
                            : controlButtonBg
                        }
                        focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${
                          theme === "dark"
                            ? "focus:ring-offset-gray-800"
                            : "focus:ring-offset-white"
                        }
                        ${
                          selectedNodeId === "Node 4"
                            ? "focus:ring-amber-300"
                            : "focus:ring-sky-300"
                        }
                        `}
          >
            Focus Node 4 (80 Sites)
          </button>
          <button
            onClick={() => setSelectedNodeId("Node 3")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium text-white
                        ${
                          selectedNodeId === "Node 3"
                            ? controlButtonActiveBg
                            : controlButtonBg
                        }
                        focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${
                          theme === "dark"
                            ? "focus:ring-offset-gray-800"
                            : "focus:ring-offset-white"
                        }
                        ${
                          selectedNodeId === "Node 3"
                            ? "focus:ring-amber-300"
                            : "focus:ring-sky-300"
                        }
                        `}
          >
            Focus Node 3 (30 Sites)
          </button>
        </div>
      )}

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
