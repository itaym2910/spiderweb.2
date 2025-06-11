// src/components/CoreSite/CoreSitePage.jsx
import React from "react";
import { useCoreSiteData } from "./useCoreSiteData";
import CoreSiteView from "./CoreSiteView";

export default function CoreSitePage({
  theme = "dark",
  popupAnchor = { top: 20, right: 20 },
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
    setSelectedNodeId,
    openPopups,
    handleSiteClick,
    handleLinkClick,
    closePopup,
    handleBackToChart,
    getPopupPositioning,
    showExtendedNodes, // Get from hook
    handleToggleExtendedNodes, // Get from hook
  } = useCoreSiteData(popupAnchor);

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
      setSelectedNodeId={setSelectedNodeId}
      openPopups={openPopups}
      onSiteClick={handleSiteClick}
      onLinkClick={handleLinkClick}
      onClosePopup={closePopup}
      onBackToChart={handleBackToChart}
      getPopupPositioning={getPopupPositioning}
      showExtendedNodes={showExtendedNodes} // Pass down
      onToggleExtendedNodes={handleToggleExtendedNodes} // Pass down
    />
  );
}
