// src/components/CoreSite/useCoreSiteData.js
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout";
import { usePopupManager } from "./usePopupManager";

export function useCoreSiteData(popupAnchor) {
  const { zoneId } = useParams(); // zoneId is obtained here
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Log 5: Check zoneId from useParams
  console.log("[useCoreSiteData] zoneId from useParams:", zoneId);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState("Node 4");
  const [showExtendedNodes, setShowExtendedNodes] = useState(false); // NEW STATE
  const [animateExtendedLayoutUp, setAnimateExtendedLayoutUp] = useState(false);

  const { openPopups, addOrUpdatePopup, closePopup, getPopupPositioning } =
    usePopupManager(popupAnchor);

  useEffect(() => {
    if (showExtendedNodes) {
      // Phase 1: Show N5, N6 lower down (animateExtendedLayoutUp is false)
      setAnimateExtendedLayoutUp(false); // Ensure it's initially false for the lower position
      const timer = setTimeout(() => {
        // Phase 2: Trigger animation upwards
        setAnimateExtendedLayoutUp(true);
      }, 100); // Small delay before triggering the upward animation
      return () => clearTimeout(timer);
    } else {
      // When hiding extended nodes, reset the animation state
      setAnimateExtendedLayoutUp(false);
    }
  }, [showExtendedNodes]);

  useLayoutEffect(() => {
    if (zoneId !== "Zone 5" && zoneId !== "Zone 6") {
      setShowExtendedNodes(false); // Reset if navigating away from Z5/Z6
    }
    // setShowExtendedNodes(false); // Original reset, might conflict if we want to keep state within Z5/Z6
  }, [zoneId]);

  useLayoutEffect(() => {
    setShowExtendedNodes(false);
  }, [zoneId]);

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
  }, []);

  const { nodes, links, centerX, centerY } = useNodeLayout(
    dimensions.width,
    dimensions.height,
    showExtendedNodes,
    animateExtendedLayoutUp
  );

  // Log 6: Check nodes and links received from useNodeLayout
  console.log(
    "[useCoreSiteData] Nodes from useNodeLayout:",
    nodes ? nodes.map((n) => n.id).join(", ") : "undefined",
    "Links count:",
    links ? links.length : "undefined"
  );
  console.log("[useCoreSiteData] showExtendedNodes:", showExtendedNodes);

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
    addOrUpdatePopup(siteDetailPayload);
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
    addOrUpdatePopup(newLinkPopupData);
  };

  const handleBackToChart = () => navigate("..");

  const handleToggleExtendedNodes = () => {
    setShowExtendedNodes((prev) => !prev);
  };

  return {
    zoneId, // Still needed for CoreSiteControls to decide if the button appears
    containerRef,
    dimensions,
    nodes,
    links,
    centerX,
    centerY,
    selectedNodeId,
    setSelectedNodeId,
    showExtendedNodes, // Expose this state
    handleToggleExtendedNodes, // Expose the handler
    handleSiteClick,
    handleLinkClick,
    handleBackToChart,
    openPopups,
    closePopup,
    getPopupPositioning,
  };
}
