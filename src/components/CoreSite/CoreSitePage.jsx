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
    handleMainToggleSwitch,
    showExtendedNodes,
    handleToggleExtendedNodes,
    mainToggleNode1Text,
    mainToggleNode2Text,
    handleBackToChart,
    onSiteClick,
    onLinkClick,
    onNodeClickInZone,
    // --- NEW TAB STATE FROM HOOK ---
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
      onMainToggleSwitch={handleMainToggleSwitch}
      showExtendedNodes={showExtendedNodes}
      onToggleExtendedNodes={handleToggleExtendedNodes}
      mainToggleNode1Text={mainToggleNode1Text}
      mainToggleNode2Text={mainToggleNode2Text}
      onBackToChart={handleBackToChart}
      onSiteClick={onSiteClick}
      onLinkClick={onLinkClick}
      onNodeClick={onNodeClickInZone}
      // --- PASS TAB PROPS TO VIEW ---
      openDetailTabs={openDetailTabs}
      activeDetailTabId={activeDetailTabId}
      onSetActiveTab={setActiveDetailTabId}
      onCloseTab={handleCloseTab}
      onNavigateToSite={handleNavigateToSite}
    />
  );
}
