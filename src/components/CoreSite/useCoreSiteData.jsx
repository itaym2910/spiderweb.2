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
import { selectAllSites } from "../../redux/slices/sitesSlice";
import { selectLinksByTypeId } from "../../redux/slices/tenGigLinksSlice";
import { selectAllDevices } from "../../redux/slices/devicesSlice";
import { selectAllPikudim } from "../../redux/slices/corePikudimSlice";

export function useCoreSiteData(chartType) {
  const { zoneId, nodeId: nodeIdFromUrl } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const allPikudim = useSelector(selectAllPikudim);
  const allDevices = useSelector(selectAllDevices);
  const allSites = useSelector(selectAllSites);
  const allLinksForChart = useSelector((state) =>
    selectLinksByTypeId(state, chartType === "P" ? 2 : 1)
  );

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
  const [openDetailTabs, setOpenDetailTabs] = useState([]);
  const [activeDetailTabId, setActiveDetailTabId] = useState(null);

  const sitesForFocusedNode = useMemo(() => {
    // This logic will only re-run if allDevices, selectedNodeId, or allSites changes.
    if (!selectedNodeId || !allDevices.length || !allSites.length) {
      return [];
    }

    // 1. Find the full device object for the selectedNodeId (which is a hostname)
    const focusedDevice = allDevices.find((d) => d.hostname === selectedNodeId);

    // 2. If we found the device, use its real ID to filter the sites
    if (focusedDevice) {
      return allSites.filter((site) => site.device_id === focusedDevice.id);
    }

    // 3. Otherwise, return an empty array
    return [];
  }, [allDevices, selectedNodeId, allSites]);

  useEffect(() => {
    if (devicesForZone.length > 0 && !selectedNodeId) {
      const initialNodeId = nodeIdFromUrl || devicesForZone[0].hostname;
      setSelectedNodeId(initialNodeId);
      setPreviousSelectedNodeId(initialNodeId);
    }
  }, [devicesForZone, nodeIdFromUrl, selectedNodeId]);

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
    devicesForZone,
    allLinksForChart
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

  const onNodeClickInZone = (clickedNodeData) => {
    if (!clickedNodeData || !clickedNodeData.id) {
      console.warn("Node data incomplete for action:", clickedNodeData);
      return;
    }

    // --- THIS IS THE CORE LOGIC ---
    if (clickedNodeData.id === selectedNodeId) {
      // The user clicked on the node that is ALREADY focused.
      // This is our trigger to navigate.
      console.log(
        `Navigating to details for already-focused node: ${clickedNodeData.id}`
      );
      navigate(`node/${clickedNodeData.id}`);
    } else {
      // The user clicked on a DIFFERENT node.
      // The action is to change the focus.
      console.log(`Setting focus to ${clickedNodeData.id}`);
      setSelectedNodeId(clickedNodeData.id);
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

  // REPLACE THE OLD FUNCTION WITH THIS NEW ONE:

  const handleNavigateToSite = useCallback(
    (clickedSiteData) => {
      // `clickedSiteData` is the single site object from the tab.
      // It contains the `name` property (e.g., "Site West Pasquale").
      if (!clickedSiteData || !clickedSiteData.name) {
        console.error("Navigation failed: No site data provided.");
        return;
      }

      // 1. Get the English name of the site. This is our unique key to find the group.
      const targetSiteName = clickedSiteData.name;

      // 2. Search through the `allSites` array (which you already have in this hook)
      //    to find every connection that matches this name. This rebuilds the "group".
      const siteGroup = allSites.filter(
        (site) => site.site_name_english === targetSiteName
      );

      // 3. If we found at least one matching site, we can navigate.
      if (siteGroup.length > 0) {
        // Create a URL-friendly version of the name.
        const navId = encodeURIComponent(targetSiteName);

        // 4. THIS IS THE CRITICAL FIX:
        //    Navigate with the data in the CORRECT format. The router expects an
        //    object with a `siteGroupData` key, and its value is the array we just built.
        navigate(`/sites/site/${navId}`, {
          state: { siteGroupData: siteGroup },
        });
      } else {
        // Optional: Handle the case where for some reason the site couldn't be found.
        console.error(
          "Could not find a matching site group for:",
          targetSiteName
        );
      }
    },
    [navigate, allSites]
  ); // <-- Add `allSites` to the dependency array

  const handleSiteClick = (siteData) => {
    // Modified to accept the whole site object
    const siteDetailPayload = {
      id: siteData.id, // Use the real ID
      navId: `site-${siteData.id}`,
      name: siteData.site_name_english, // Use the real name
      type: "site",
      zone: zoneId,
      // You can add more real data from the site object here if needed
      description: `Details for ${siteData.site_name_english}`,
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
    showExtendedNodes,
    handleToggleExtendedNodes,
    devicesInZoneCount: devicesForZone.length,
    handleBackToChart,
    sitesForFocusedNode,
    onSiteClick: handleSiteClick,
    onLinkClick: handleLinkClick,
    onNodeClickInZone: onNodeClickInZone,
    openDetailTabs,
    activeDetailTabId,
    setActiveDetailTabId,
    handleCloseTab,
    handleNavigateToSite,
  };
}
