// src/components/CoreSite/useCoreSiteData.js
import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout";
// REMOVED: import { usePopupManager } from "./usePopupManager";

// Add chartType as a parameter to the hook
export function useCoreSiteData(chartType) {
  const { zoneId, nodeId: nodeIdFromUrl } = useParams(); // Get nodeId from URL
  const navigate = useNavigate();
  const containerRef = useRef(null);

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

  // --- REPLACED POPUP MANAGER WITH TAB STATE ---
  const [openDetailTabs, setOpenDetailTabs] = useState([]);
  const [activeDetailTabId, setActiveDetailTabId] = useState(null);

  // useEffects for layout, animation, and zone changes remain the same
  useEffect(() => {
    setSelectedNodeId(nodeIdFromUrl || "Node 4");
  }, [nodeIdFromUrl]);

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
    if (showExtendedNodes) {
      setSelectedNodeId((prev) => (prev === "Node 5" ? "Node 6" : "Node 5"));
    } else {
      setSelectedNodeId((prev) => (prev === "Node 4" ? "Node 3" : "Node 4"));
    }
  };

  const onNodeClickInZone = (nodeData) => {
    if (nodeData && nodeData.id) {
      navigate(`node/${nodeData.id}`);
    } else {
      console.warn(
        "CoreSitePage: Node data incomplete for navigation:",
        nodeData
      );
    }
  };

  // --- NEW HANDLERS FOR THE TAB UI ---
  const addOrActivateTab = useCallback((payload) => {
    const { id, type } = payload;
    const tabId = `${type}-${id}`;

    setOpenDetailTabs((prevTabs) => {
      const tabExists = prevTabs.some((tab) => tab.id === tabId);
      if (tabExists) {
        return prevTabs;
      }
      let title = "Details";
      if (type === "link") {
        title = `${payload.sourceNode} - ${payload.targetNode}`;
      } else if (type === "site") {
        title = payload.name;
      }
      return [...prevTabs, { id: tabId, type, title, data: payload }];
    });
    setActiveDetailTabId(tabId);
  }, []);

  const handleCloseTab = useCallback(
    (tabIdToClose) => {
      setOpenDetailTabs((prevTabs) => {
        const remainingTabs = prevTabs.filter((tab) => tab.id !== tabIdToClose);
        if (activeDetailTabId === tabIdToClose) {
          setActiveDetailTabId(
            remainingTabs.length > 0
              ? remainingTabs[remainingTabs.length - 1].id
              : null
          );
        }
        return remainingTabs;
      });
    },
    [activeDetailTabId]
  );

  const handleNavigateToSite = useCallback(
    (siteData) => {
      if (siteData.navId) {
        // --- THIS IS THE FIX ---
        // Add a second argument to navigate() to pass state.
        navigate(`/sites/site/${siteData.navId}`, {
          state: { siteData: siteData }, // Pass the data payload here
        });
      }
    },
    [navigate]
  );

  // --- MODIFIED CLICK HANDLERS ---
  const handleSiteClick = (siteIndex, siteName) => {
    const navigationId = `${zoneId}-Site${siteIndex + 1}`;
    const siteDetailPayload = {
      id: navigationId,
      navId: navigationId,
      name: siteName,
      type: "site",
      zone: zoneId,
      // ... same data as before
      physicalStatus: Math.random() > 0.2 ? "Up" : "Down",
      protocolStatus: Math.random() > 0.2 ? "Up" : "Down", // Changed to match StatusBulb
      ospfStatus: "Full",
      mplsStatus: "Active",
      description: `Detailed description for ${siteName} in ${zoneId}.`,
      mediaType: "Fiber",
      cdpNeighbors: "Core-Router-A",
      containerName: "Rack 4, Unit 8",
    };
    addOrActivateTab(siteDetailPayload);
  };

  const handleLinkClick = (linkData) => {
    const newLinkPayload = {
      id: linkData.id || `link-${linkData.source.id}-${linkData.target.id}`,
      type: "link",
      sourceNode: linkData.source.id,
      targetNode: linkData.target.id,
      name: `Link: ${linkData.source.id} ↔ ${linkData.target.id}`,
      linkBandwidth: `${Math.floor(Math.random() * 1000) + 100} Gbps`,
      latency: `${Math.floor(Math.random() * 50) + 1} ms`,
      utilization: `${Math.floor(Math.random() * 100)}%`,
      status: Math.random() > 0.15 ? "up" : "down", // Changed to match StatusBulb
      linkId: linkData.id,
      linkDescription: "Core fiber optic interconnect.",
    };
    addOrActivateTab(newLinkPayload);
  };

  const handleBackToChart = () => {
    const basePath = chartType === "p-chart" ? "/p-chart" : "/l-chart";
    navigate(basePath);
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
    onSiteClick: handleSiteClick,
    onLinkClick: handleLinkClick,
    onNodeClickInZone: onNodeClickInZone,
    // --- EXPORT NEW TAB STATE AND HANDLERS ---
    openDetailTabs,
    activeDetailTabId,
    setActiveDetailTabId, // Pass the setter directly
    handleCloseTab,
    handleNavigateToSite,
  };
}
