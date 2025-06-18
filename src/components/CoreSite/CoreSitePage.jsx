// src/components/CoreSite/CoreSitePage.jsx
import React from "react";
import { useCoreSiteData } from "./useCoreSiteData";
import CoreSiteView from "./CoreSiteView";

export default function CoreSitePage({
  theme = "dark",
  popupAnchor = { top: 20, right: 20 },
  chartType, // Expect chartType prop
}) {
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
    openPopups,
    onSiteClick,
    onLinkClick,
    onClosePopup,
    getPopupPositioning,
    onNodeClickInZone,
  } = useCoreSiteData(popupAnchor, chartType); // Pass chartType to the hook

  return (
    <CoreSiteView
      theme={theme}
      zoneId={zoneId} // This is the actual zone name from URL params e.g. "WSD"
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
      openPopups={openPopups}
      onSiteClick={onSiteClick}
      onLinkClick={onLinkClick}
      onClosePopup={onClosePopup}
      getPopupPositioning={getPopupPositioning}
      onNodeClick={onNodeClickInZone}
      // chartType={chartType} // Pass to CoreSiteView if it needs it directly
    />
  );
}
