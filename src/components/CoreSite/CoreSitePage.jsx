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
    selectedNodeId, // Get from hook
    setSelectedNodeId, // Get from hook
    openPopups,
    handleSiteClick,
    handleLinkClick,
    closePopup,
    handleBackToChart,
    getPopupPositioning,
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
      selectedNodeId={selectedNodeId} // Pass down
      setSelectedNodeId={setSelectedNodeId} // Pass down
      openPopups={openPopups}
      onSiteClick={handleSiteClick}
      onLinkClick={handleLinkClick}
      onClosePopup={closePopup}
      onBackToChart={handleBackToChart}
      getPopupPositioning={getPopupPositioning}
    />
  );
}
