// src/components/CoreSite/CoreSiteView.jsx

import React, { useRef } from "react";
import CoreSiteCanvas from "./CoreSiteCanvas";
import SitesBar from "./SitesBar";
import LinkDetailTabs from "../LinkDetailTabs"; // Import the tab component
import CoreSiteControls from "./CoreSiteControls";

// Icon component for the "Back to Chart" button
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
  onMainToggleSwitch,
  showExtendedNodes,
  onToggleExtendedNodes,
  mainToggleNode1Text,
  mainToggleNode2Text,
  onBackToChart,
  onSiteClick,
  onLinkClick,
  onNodeClick,
  // --- NEW PROPS FOR TABS ---
  openDetailTabs,
  activeDetailTabId,
  onSetActiveTab,
  onCloseTab,
  onNavigateToSite,
}) {
  const svgRef = useRef(null);
  const siteRefs = useRef([]);
  const focusedNodeDataRef = useRef(null);

  // --- Style constants for theme-awareness ---
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

  // --- Loading State ---
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

  // --- Dynamic positioning for Back button ---
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
    // UPDATED LAYOUT: Use flexbox column to stack the tab bar and the main content area.
    <div
      ref={containerRef}
      className={`w-full h-full ${pageBgColor} flex flex-col overflow-hidden`}
    >
      {/* 1. RENDER TABS AT THE TOP if they exist */}
      {openDetailTabs && openDetailTabs.length > 0 && (
        <div className="flex-shrink-0">
          <LinkDetailTabs
            tabs={openDetailTabs}
            activeTabId={activeDetailTabId}
            onSetActiveTab={onSetActiveTab}
            onCloseTab={onCloseTab}
            onNavigateToSite={onNavigateToSite}
            theme={theme}
          />
        </div>
      )}

      {/* 2. Main content area that grows to fill the remaining space */}
      <div className="flex-grow relative">
        {/* Back button and Controls are absolutely positioned within this main content area */}
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

        {/* The canvas and sites bar also live in this container and are sized relative to it */}
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
          theme={theme}
          onLinkClick={onLinkClick}
          onNodeClick={onNodeClick}
        />
        <SitesBar
          svgRef={svgRef}
          focusedNodeDataRef={focusedNodeDataRef}
          focusedNodeId={selectedNodeId}
          siteRefs={siteRefs}
          theme={theme}
          onSiteClick={onSiteClick}
        />
      </div>

      {/* REMOVED: The entire div that used to map over openPopups and render SiteDetailPopup */}
    </div>
  );
}
