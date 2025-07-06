// src/components/CoreSite/CoreSiteView.jsx

import React, { useRef } from "react";
import CoreSiteCanvas from "./CoreSiteCanvas";
import SitesBar from "./SitesBar";
import LinkDetailTabs from "../shared/LinkDetailTabs"; // Import the tab component
import CoreSiteControls from "./CoreSiteControls";

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
  showExtendedNodes,
  onToggleExtendedNodes,
  sites,
  onSiteClick,
  onLinkClick,
  onNodeClick,
  devicesInZoneCount,
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

        <CoreSiteControls
          theme={theme}
          displayZoneId={displayZoneId}
          zoneId={zoneId}
          showExtendedNodes={showExtendedNodes}
          onToggleExtendedNodes={onToggleExtendedNodes}
          devicesInZoneCount={devicesInZoneCount}
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
          sites={sites}
          onSiteClick={onSiteClick}
        />
      </div>
    </div>
  );
}
