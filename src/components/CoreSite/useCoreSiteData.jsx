// src/components/CoreSite/useCoreSiteData.js
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout";
import { usePopupManager } from "./usePopupManager";

export function useCoreSiteData(popupAnchor) {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState("Node 4"); // Default for N3/N4 toggle
  const [showExtendedNodes, setShowExtendedNodes] = useState(false);
  const [animateExtendedLayoutUp, setAnimateExtendedLayoutUp] = useState(false);
  const [previousSelectedNodeId, setPreviousSelectedNodeId] =
    useState("Node 4"); // Store N3/N4 selection

  // Texts for the main toggle switch
  const [mainToggleNode1Text, setMainToggleNode1Text] =
    useState("Node 4 (80 Sites)"); // Corresponds to ID "Node 4"
  const [mainToggleNode2Text, setMainToggleNode2Text] =
    useState("Node 3 (30 Sites)"); // Corresponds to ID "Node 3"

  const { openPopups, addOrUpdatePopup, closePopup, getPopupPositioning } =
    usePopupManager(popupAnchor);

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
    // When navigating away from Z5/Z6, reset everything to base state
    if (zoneId !== "Zone 5" && zoneId !== "Zone 6") {
      setShowExtendedNodes(false);
      setSelectedNodeId(previousSelectedNodeId || "Node 4"); // Restore or default
      setMainToggleNode1Text("Node 4 (80 Sites)");
      setMainToggleNode2Text("Node 3 (30 Sites)");
    }
  }, [zoneId, previousSelectedNodeId]); // Added previousSelectedNodeId to deps

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

  const handleToggleExtendedNodes = () => {
    setShowExtendedNodes((prevShowExtended) => {
      const nextShowExtended = !prevShowExtended;
      if (nextShowExtended) {
        // Switching TO N5/N6 view
        setPreviousSelectedNodeId(selectedNodeId); // Save current N3/N4 selection
        setSelectedNodeId("Node 5"); // Set focus to Node 5
        setMainToggleNode1Text("Node 5 (80 Sites)"); // Text for Node 5 option
        setMainToggleNode2Text("Node 6 (30 Sites)"); // Text for Node 6 option
      } else {
        // Switching BACK TO N1/N2/N3/N4 view
        setSelectedNodeId(previousSelectedNodeId); // Restore previous N3/N4 selection
        setMainToggleNode1Text("Node 4 (80 Sites)");
        setMainToggleNode2Text("Node 3 (30 Sites)");
      }
      return nextShowExtended;
    });
  };

  const handleMainToggleSwitch = () => {
    // This handler now needs to know if it's controlling N3/N4 or N5/N6
    if (showExtendedNodes) {
      // We are in N5/N6 mode for the main toggle
      setSelectedNodeId((prev) => (prev === "Node 5" ? "Node 6" : "Node 5"));
    } else {
      // We are in N3/N4 mode for the main toggle
      setSelectedNodeId((prev) => (prev === "Node 4" ? "Node 3" : "Node 4"));
    }
  };

  const handleNodeClickInZone = (nodeData) => {
    if (nodeData && nodeData.id) {
      // Navigate to the node detail view, relative to the current zone path
      // e.g., if current path is /l-zone/Zone1, this navigates to /l-zone/Zone1/node/NODE_ID
      navigate(`node/${nodeData.id}`);
    } else {
      console.warn(
        "CoreSitePage: Node data incomplete for navigation:",
        nodeData
      );
    }
  };

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
