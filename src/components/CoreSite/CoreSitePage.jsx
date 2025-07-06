// src/components/CoreSite/CoreSitePage.jsx
import React from "react";
import { useCoreSiteData } from "./useCoreSiteData";
import CoreSiteView from "./CoreSiteView";

export default function CoreSitePage({ theme = "dark", chartType }) {
  const {
    zoneId,
    containerRef,
    dimensions,
    nodes,
    links,
    centerX,
    centerY,
    selectedNodeId,
    showExtendedNodes,
    handleToggleExtendedNodes,
    sitesForFocusedNode,
    onSiteClick,
    onLinkClick,
    onNodeClickInZone,
    devicesInZoneCount,
    openDetailTabs,
    activeDetailTabId,
    setActiveDetailTabId,
    handleCloseTab,
    handleNavigateToSite,
  } = useCoreSiteData(chartType);

  return (
    <CoreSiteView
      theme={theme}
      zoneId={zoneId}
      containerRef={containerRef}
      dimensions={dimensions}
      nodes={nodes}
      links={links}
      centerX={centerX}
      centerY={centerY}
      selectedNodeId={selectedNodeId}
      showExtendedNodes={showExtendedNodes}
      onToggleExtendedNodes={handleToggleExtendedNodes}
      sites={sitesForFocusedNode}
      onSiteClick={onSiteClick}
      onLinkClick={onLinkClick}
      onNodeClick={onNodeClickInZone}
      devicesInZoneCount={devicesInZoneCount}
      openDetailTabs={openDetailTabs}
      activeDetailTabId={activeDetailTabId}
      onSetActiveTab={setActiveDetailTabId}
      onCloseTab={handleCloseTab}
      onNavigateToSite={handleNavigateToSite}
    />
  );
}
