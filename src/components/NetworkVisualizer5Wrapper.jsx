import React, { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import NetworkVisualizer5 from "./chart/NetworkVisualizer5";
import LinkDetailTabs from "./LinkDetailTabs";

// --- NEW: Import selectors from your Redux slices ---
import { selectAllPikudim } from "../redux/slices/corePikudimSlice";
import { selectAllDevices } from "../redux/slices/devicesSlice";
import { selectAllTenGigLinks } from "../redux/slices/tenGigLinksSlice";

const NetworkVisualizer5Wrapper = ({ theme }) => {
  const navigate = useNavigate();

  // --- State reverted to ONLY manage LINK tabs ---
  const [openLinkTabs, setOpenLinkTabs] = useState([]);
  const [activeLinkTabId, setActiveLinkTabId] = useState(null);

  // --- NEW: Fetch raw data from the Redux store ---
  const pikudim = useSelector(selectAllPikudim);
  const devices = useSelector(selectAllDevices);
  const linksRaw = useSelector(selectAllTenGigLinks);

  const graphData = useMemo(() => {
    if (!pikudim.length || !devices.length) {
      return { nodes: [], links: [] };
    }

    const pikudimMap = pikudim.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    // 1. Transform devices into NODES
    const transformedNodes = devices.map((device) => ({
      id: device.hostname,
      group: "node",
      zone:
        pikudimMap[device.core_pikudim_site_id]?.core_site_name ||
        "Unknown Zone",
    }));

    // 2. Transform tenGigLinks into LINKS
    const transformedLinks = linksRaw.map((link) => ({
      id: link.id,
      source: link.source,
      target: link.target,
      category: link.status, // Map 'status' to the 'category' field
    }));

    return { nodes: transformedNodes, links: transformedLinks };
  }, [pikudim, devices, linksRaw]);

  const handleZoneClick = useCallback(
    (zoneId) => {
      navigate(`zone/${zoneId}`);
    },
    [navigate]
  );

  // --- REVERTED handleNodeClick to navigate to the LinkTable page ---
  const handleNodeClick = useCallback(
    (nodeData) => {
      if (nodeData && nodeData.id && nodeData.zone) {
        // This now navigates to the dedicated page for the node (e.g., LinkTable)
        navigate(`zone/${nodeData.zone}/node/${nodeData.id}`);
      } else {
        console.warn("Node data incomplete for navigation:", nodeData);
      }
    },
    [navigate]
  );

  // --- handleLinkClick remains the same, opening a tab ---
  const handleLinkClick = useCallback(
    (linkDetailPayload) => {
      const { id, sourceNode, targetNode } = linkDetailPayload;
      const tabExists = openLinkTabs.some((tab) => tab.id === id);

      if (!tabExists) {
        const newTab = {
          id: id,
          title: `${sourceNode} - ${targetNode}`,
          type: "link", // This is a link tab
          data: linkDetailPayload,
        };
        setOpenLinkTabs((prevTabs) => [...prevTabs, newTab]);
      }
      setActiveLinkTabId(id);
    },
    [openLinkTabs]
  );

  // --- handleCloseTab updated to use link-specific state ---
  const handleCloseTab = useCallback(
    (tabIdToClose) => {
      setOpenLinkTabs((prevTabs) => {
        const remainingTabs = prevTabs.filter((tab) => tab.id !== tabIdToClose);
        if (activeLinkTabId === tabIdToClose) {
          if (remainingTabs.length > 0) {
            setActiveLinkTabId(remainingTabs[remainingTabs.length - 1].id);
          } else {
            setActiveLinkTabId(null);
          }
        }
        return remainingTabs;
      });
    },
    [activeLinkTabId]
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* 1. Link Detail Tabs (now only shows link tabs) */}
      {openLinkTabs.length > 0 && (
        <div className="flex-shrink-0">
          <LinkDetailTabs
            tabs={openLinkTabs}
            activeTabId={activeLinkTabId}
            onSetActiveTab={setActiveLinkTabId}
            onCloseTab={handleCloseTab}
            theme={theme}
            // onNavigateToSite is no longer needed here
          />
        </div>
      )}

      {/* 2. Network Visualizer */}
      <div className="flex-grow relative">
        <NetworkVisualizer5
          data={graphData}
          theme={theme}
          onZoneClick={handleZoneClick}
          onLinkClick={handleLinkClick}
          onNodeClick={handleNodeClick} // This now correctly triggers navigation
        />
      </div>
    </div>
  );
};

export default NetworkVisualizer5Wrapper;
