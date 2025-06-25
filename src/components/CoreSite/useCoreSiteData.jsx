import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout";
import { selectAllDevices } from "../../redux/slices/devicesSlice";
import { selectAllPikudim } from "../../redux/slices/corePikudimSlice";

export function useCoreSiteData(chartType) {
  const { zoneId, nodeId: nodeIdFromUrl } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const allDevices = useSelector(selectAllDevices);
  const allPikudim = useSelector(selectAllPikudim);

  const devicesForZone = useMemo(() => {
    if (!zoneId || !allPikudim.length || !allDevices.length) return [];
    const currentPikud = allPikudim.find((p) => p.core_site_name === zoneId);
    if (!currentPikud) return [];
    return allDevices.filter((d) => d.core_pikudim_site_id === currentPikud.id);
  }, [zoneId, allDevices, allPikudim]);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showExtendedNodes, setShowExtendedNodes] = useState(false);
  const [animateExtendedLayoutUp, setAnimateExtendedLayoutUp] = useState(false);
  const [previousSelectedNodeId, setPreviousSelectedNodeId] = useState(null);

  // --- State for the toggle switch text ---
  const [mainToggleNode1Text, setMainToggleNode1Text] = useState("");
  const [mainToggleNode2Text, setMainToggleNode2Text] = useState("");

  const [openDetailTabs, setOpenDetailTabs] = useState([]);
  const [activeDetailTabId, setActiveDetailTabId] = useState(null);

  useEffect(() => {
    if (devicesForZone.length > 0 && !selectedNodeId) {
      const initialNodeId = nodeIdFromUrl || devicesForZone[0].hostname;
      setSelectedNodeId(initialNodeId);
      setPreviousSelectedNodeId(initialNodeId);
    }
  }, [devicesForZone, nodeIdFromUrl, selectedNodeId]);

  useEffect(() => {
    // Dynamically update toggle switch text based on the current view
    let toggleDevice1, toggleDevice2;
    if (showExtendedNodes) {
      // Extended view toggle is for devices at index 4 and 5
      toggleDevice1 = devicesForZone[4];
      toggleDevice2 = devicesForZone[5];
    } else {
      // Initial view toggle is for devices at index 2 and 3
      toggleDevice1 = devicesForZone[2];
      toggleDevice2 = devicesForZone[3];
    }
    setMainToggleNode1Text(toggleDevice1?.hostname || "N/A");
    setMainToggleNode2Text(toggleDevice2?.hostname || "N/A");
  }, [showExtendedNodes, devicesForZone]);

  useEffect(() => {
    if (showExtendedNodes) {
      setAnimateExtendedLayoutUp(false);
      const timer = setTimeout(() => setAnimateExtendedLayoutUp(true), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimateExtendedLayoutUp(false);
    }
  }, [showExtendedNodes]);

  useLayoutEffect(() => {
    // This effect can be simplified or removed if not strictly needed
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
    if (containerRef.current) updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const {
    nodes: layoutNodes,
    links: layoutLinks,
    centerX,
    centerY,
  } = useNodeLayout(
    dimensions.width,
    dimensions.height,
    showExtendedNodes,
    animateExtendedLayoutUp,
    devicesForZone
  );

  const nodes = layoutNodes.filter((node) => node.id !== "None");
  const links = layoutLinks.filter(
    (link) => link.source.id !== "None" && link.target.id !== "None"
  );

  const handleToggleExtendedNodes = () => {
    setShowExtendedNodes((prevShowExtended) => {
      const nextShowExtended = !prevShowExtended;
      if (nextShowExtended) {
        // Switching to extended view
        setPreviousSelectedNodeId(selectedNodeId);
        // Select the first visible node in the new layout (device at index 2)
        const newSelected = devicesForZone[2]?.hostname;
        if (newSelected) setSelectedNodeId(newSelected);
      } else {
        // Switching back to initial view
        // Restore previous selection or default to first device
        setSelectedNodeId(
          previousSelectedNodeId || devicesForZone[0]?.hostname
        );
      }
      return nextShowExtended;
    });
  };

  const handleMainToggleSwitch = () => {
    const devicesInToggle = showExtendedNodes
      ? [devicesForZone[4], devicesForZone[5]]
      : [devicesForZone[2], devicesForZone[3]];

    const device1 = devicesInToggle[0];
    const device2 = devicesInToggle[1];

    if (device1 && device2) {
      setSelectedNodeId((prev) =>
        prev === device1.hostname ? device2.hostname : device1.hostname
      );
    } else if (device1) {
      setSelectedNodeId(device1.hostname); // If only one device, just select it
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
        navigate(`/sites/site/${siteData.navId}`, {
          state: { siteData: siteData },
        });
      }
    },
    [navigate]
  );

  const handleSiteClick = (siteIndex, siteName) => {
    const navigationId = `${zoneId}-Site${siteIndex + 1}`;
    const siteDetailPayload = {
      id: navigationId,
      navId: navigationId,
      name: siteName,
      type: "site",
      zone: zoneId,
      physicalStatus: Math.random() > 0.2 ? "Up" : "Down",
      protocolStatus: Math.random() > 0.2 ? "Up" : "Down",
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
      status: Math.random() > 0.15 ? "up" : "down",
      linkId: linkData.id,
      linkDescription: "Core fiber optic interconnect.",
    };
    addOrActivateTab(newLinkPayload);
  };

  const handleBackToChart = () => {
    const basePath = chartType === "P" ? "/p-chart" : "/l-chart";
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
    openDetailTabs,
    activeDetailTabId,
    setActiveDetailTabId,
    handleCloseTab,
    devicesInZoneCount: devicesForZone.length,
    handleNavigateToSite,
  };
}
