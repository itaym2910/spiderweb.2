// src/components/CoreSite/CoreSitePage.jsx
import React from "react";
import { useCoreSiteData } from "./useCoreSiteData";
import CoreSiteView from "./CoreSiteView";

export default function CoreSitePage({
  theme = "dark",
  popupAnchor = { top: 20, right: 20 },
}) {
  const {
    // ... (other props like zoneId, nodes, selectedNodeId, etc.)
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

    // POPUP RELATED PROPS - Ensure they are destructured and passed
    openPopups,
    onSiteClick, // Destructure
    onLinkClick, // Destructure
    onClosePopup, // Destructure
    getPopupPositioning, // Destructure
  } = useCoreSiteData(popupAnchor);

  return (
    <CoreSiteView
      // ... (other props)
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
      // POPUP RELATED PROPS - Pass them down
      openPopups={openPopups}
      onSiteClick={onSiteClick} // Pass down
      onLinkClick={onLinkClick} // Pass down
      onClosePopup={onClosePopup} // Pass down
      getPopupPositioning={getPopupPositioning} // Pass down
    />
  );
}
