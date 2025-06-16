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
    />
  );
}
