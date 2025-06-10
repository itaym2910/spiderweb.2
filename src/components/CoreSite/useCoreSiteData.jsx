// src/components/CoreSite/useCoreSiteData.js
import { useState, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout";
import { usePopupManager } from "./usePopupManager"; // Import the new popup manager hook

export function useCoreSiteData(popupAnchor) {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Use the popup manager hook
  const { openPopups, addOrUpdatePopup, closePopup, getPopupPositioning } =
    usePopupManager(popupAnchor);

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    if (containerRef.current) {
      updateDimensions(); // Initial call
    }
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []); // containerRef is stable, no need to add as dependency unless it can change identity

  const { nodes, links, centerX, centerY } = useNodeLayout(
    dimensions.width,
    dimensions.height
  );

  const handleSiteClick = (siteIndex, siteName) => {
    const siteDetailPayload = {
      id: siteIndex,
      name: siteName,
      type: "site",
      physicalStatus: Math.random() > 0.2 ? "Up" : "Down",
      protocolStatus: Math.random() > 0.2 ? "Active" : "Inactive",
      ospfStatus: Math.random() > 0.5 ? "Enabled" : "Disabled",
      mplsStatus: Math.random() > 0.6 ? "Active" : "Inactive",
      bandwidth: `${Math.floor(Math.random() * 90) + 10} Mbps`,
      description: `Details for site ${siteName}`,
      mediaType: Math.random() > 0.3 ? "Fiber LC" : "Copper RJ45",
      cdpNeighbors: `${Math.floor(Math.random() * 3) + 1} neighbors`,
      containerName: `POD-${Math.floor(Math.random() * 10)}`,
      mtu: Math.random() > 0.5 ? 1500 : 9000,
      crcErrors: `${Math.floor(Math.random() * 5)}`,
      inputDataRate: `${(Math.random() * 500).toFixed(2)} Mbps`,
      outputDataRate: `${(Math.random() * 300).toFixed(2)} Mbps`,
      txPower: `${(Math.random() * -5 - 1).toFixed(2)} dBm`,
      rxPower: `${(Math.random() * -7 - 1).toFixed(2)} dBm`,
      adminStatus: Math.random() > 0.2 ? "Up" : "Down (administratively)",
    };
    addOrUpdatePopup(siteDetailPayload); // Delegate to popup manager
  };

  const handleLinkClick = (linkData) => {
    const newLinkPopupData = {
      id: linkData.id || `link-${linkData.source.id}-${linkData.target.id}`,
      name: `Link: ${linkData.source.id} ↔ ${linkData.target.id}`,
      type: "link",
      sourceNode: linkData.source.id,
      targetNode: linkData.target.id,
      linkBandwidth: `${Math.floor(Math.random() * 1000) + 100} Gbps`,
      latency: `${Math.floor(Math.random() * 50) + 1} ms`,
      utilization: `${Math.floor(Math.random() * 100)}%`,
      status: Math.random() > 0.15 ? "Up" : "Down",
    };
    addOrUpdatePopup(newLinkPopupData); // Delegate to popup manager
  };

  const handleBackToChart = () => navigate("..");

  return {
    // Core site data and refs
    zoneId,
    containerRef,
    dimensions,
    nodes,
    links,
    centerX,
    centerY,
    // Click handlers
    handleSiteClick,
    handleLinkClick,
    handleBackToChart,
    // Popup related state and functions from usePopupManager
    openPopups,
    closePopup, // Renamed from handleClosePopup for consistency if preferred
    getPopupPositioning,
  };
}
