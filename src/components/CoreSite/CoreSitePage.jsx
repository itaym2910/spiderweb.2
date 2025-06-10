// src/components/CoreSite/CoreSitePage.jsx
import React from "react";
import { useCoreSiteData } from "./useCoreSiteData"; // Updated import
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
    openPopups,
    handleSiteClick,
    handleLinkClick,
    closePopup, // Updated from handleClosePopup
    handleBackToChart,
    getPopupPositioning,
  } = useCoreSiteData(popupAnchor); // Use the refactored hook

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
      openPopups={openPopups}
      onSiteClick={handleSiteClick}
      onLinkClick={handleLinkClick}
      onClosePopup={closePopup} // Pass the renamed function
      onBackToChart={handleBackToChart}
      getPopupPositioning={getPopupPositioning}
    />
  );
}
