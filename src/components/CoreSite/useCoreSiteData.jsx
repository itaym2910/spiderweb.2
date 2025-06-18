// src/components/CoreSite/useCoreSiteData.js
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout";
import { usePopupManager } from "./usePopupManager";

// Add chartType as a parameter to the hook
export function useCoreSiteData(popupAnchor, chartType) {
  const { zoneId } = useParams(); // zoneId will be "WSD", "WRR" etc.
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // ... (dimensions, selectedNodeId, showExtendedNodes, etc. states remain the same) ...
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState("Node 4");
  const [showExtendedNodes, setShowExtendedNodes] = useState(false);
  const [animateExtendedLayoutUp, setAnimateExtendedLayoutUp] = useState(false);
  const [previousSelectedNodeId, setPreviousSelectedNodeId] =
    useState("Node 4");
  const [mainToggleNode1Text, setMainToggleNode1Text] =
    useState("Node 4 (80 Sites)");
  const [mainToggleNode2Text, setMainToggleNode2Text] =
    useState("Node 3 (30 Sites)");

  const { openPopups, addOrUpdatePopup, closePopup, getPopupPositioning } =
    usePopupManager(popupAnchor);

  // ... (useEffect for animation, zone change, layout effects remain the same) ...
  useEffect(() => {
    if (showExtendedNodes) {
      setAnimateExtendedLayoutUp(false);
      const timer = setTimeout(() => setAnimateExtendedLayoutUp(true), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimateExtendedLayoutUp(false);
    }
  }, [showExtendedNodes]);

  useEffect(() => {
    if (zoneId !== "Zone 5" && zoneId !== "Zone 6") {
      setShowExtendedNodes(false);
      setSelectedNodeId(previousSelectedNodeId || "Node 4");
      setMainToggleNode1Text("Node 4 (80 Sites)");
      setMainToggleNode2Text("Node 3 (30 Sites)");
    }
  }, [zoneId, previousSelectedNodeId]);

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
      updateDimensions();
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

  const handleToggleExtendedNodes = () => {
    // ... (logic for extended nodes remains the same)
    setShowExtendedNodes((prevShowExtended) => {
      const nextShowExtended = !prevShowExtended;
      if (nextShowExtended) {
        setPreviousSelectedNodeId(selectedNodeId);
        setSelectedNodeId("Node 5");
        setMainToggleNode1Text("Node 5 (80 Sites)");
        setMainToggleNode2Text("Node 6 (30 Sites)");
      } else {
        setSelectedNodeId(previousSelectedNodeId);
        setMainToggleNode1Text("Node 4 (80 Sites)");
        setMainToggleNode2Text("Node 3 (30 Sites)");
      }
      return nextShowExtended;
    });
  };

  const handleMainToggleSwitch = () => {
    // ... (logic for main toggle remains the same)
    if (showExtendedNodes) {
      setSelectedNodeId((prev) => (prev === "Node 5" ? "Node 6" : "Node 5"));
    } else {
      setSelectedNodeId((prev) => (prev === "Node 4" ? "Node 3" : "Node 4"));
    }
  };

  const handleNodeClickInZone = (nodeData) => {
    if (nodeData && nodeData.id) {
      // Navigate relative to the current zone path (e.g., /l-chart/zone/WSD -> /l-chart/zone/WSD/node/R6)
      navigate(`node/${nodeData.id}`);
    } else {
      console.warn(
        "CoreSitePage: Node data incomplete for navigation:",
        nodeData
      );
    }
  };

  const handleSiteClick = (siteIndex, siteName) => {
    // If siteNavId needs to be "600P", then siteName or a derivative should be used.
    // For now, keeping the existing logic which uses zoneId and siteIndex.
    // The actual zoneId from URL (e.g., "WSD") is used here.
    const navigationId = `${zoneId}-Site${siteIndex + 1}`; // e.g. WSD-Site1

    const siteDetailPayload = {
      id: navigationId,
      navId: navigationId, // This will be used in /sites/site/:siteNavId
      name: siteName,
      type: "site",
      zone: zoneId,
      // ... (rest of the randomly generated site data from original code) ...
      physicalStatus: Math.random() > 0.2 ? "Up" : "Down",
      protocolStatus: Math.random() > 0.2 ? "Active" : "Inactive",
      connectedLinks: [
        {
          id: `link-${navigationId}-1`,
          name: `Link from ${navigationId} to CoreA`,
          status: "up",
          description: "Uplink",
          bandwidth: "1G",
          ospfStatus: "Full",
          mplsStatus: "Active",
        },
        {
          id: `link-${navigationId}-2`,
          name: `Link from ${navigationId} to CoreB`,
          status: "down",
          description: "Redundant Uplink",
          bandwidth: "1G",
          ospfStatus: "Down",
          mplsStatus: "Inactive",
        },
      ],
      description: `This is a detailed description for ${siteName}. It includes information about its location within ${zoneId}, its primary functions, and any notable operational characteristics. <br/><br/> <strong>Key Features:</strong><ul><li>High Availability</li><li>Redundant Power</li><li>Connection to multiple core nodes</li></ul>`,
    };
    addOrUpdatePopup(siteDetailPayload);
  };

  const handleLinkClick = (linkData) => {
    // ... (link click logic for popups remains the same) ...
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

  const handleBackToChart = () => {
    // Navigate to the base path of the current chart type
    if (chartType === "L") {
      navigate("/l-chart");
    } else if (chartType === "P") {
      navigate("/p-chart");
    } else {
      // Fallback, though chartType should always be provided
      navigate("/mainlines");
    }
  };

  return {
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
    onSiteClick: handleSiteClick,
    onLinkClick: handleLinkClick,
    onClosePopup: closePopup,
    getPopupPositioning,
    onNodeClickInZone: handleNodeClickInZone,
  };
}
