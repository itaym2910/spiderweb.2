import React, { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import NetworkVisualizer from "./chart/NetworkVisualizer";
import LinkDetailTabs from "./LinkDetailTabs";

// Import selectors from your Redux slices
import { selectAllPikudim } from "../redux/slices/corePikudimSlice";
import { selectAllDevices } from "../redux/slices/devicesSlice";
import { selectAllTenGigLinks } from "../redux/slices/tenGigLinksSlice";

const NetworkVisualizerWrapper = ({ theme }) => {
  // Removed `data` prop
  const navigate = useNavigate();

  // --- State for LINK tabs remains the same ---
  const [openLinkTabs, setOpenLinkTabs] = useState([]);
  const [activeLinkTabId, setActiveLinkTabId] = useState(null);

  // --- Fetch raw data from Redux store ---
  const pikudim = useSelector(selectAllPikudim);
  const devices = useSelector(selectAllDevices);
  const linksRaw = useSelector(selectAllTenGigLinks);

  // --- Transform Redux data into the format D3 expects ---
  // useMemo will prevent re-calculating this on every render
  const graphData = useMemo(() => {
    if (!pikudim.length || !devices.length) {
      return { nodes: [], links: [] };
    }

    // Create a quick lookup map for Pikudim names
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
      // Map the 'status' field to the 'category' field the visualizer expects
      category: link.status,
    }));

    return { nodes: transformedNodes, links: transformedLinks };
  }, [pikudim, devices, linksRaw]);

  const handleZoneClick = useCallback(
    (zoneId) => {
      navigate(`zone/${zoneId}`);
    },
    [navigate]
  );

  const handleNodeClick = useCallback(
    (nodeData) => {
      if (nodeData && nodeData.id && nodeData.zone) {
        navigate(`zone/${nodeData.zone}/node/${nodeData.id}`);
      } else {
        console.warn("Node data incomplete for navigation:", nodeData);
      }
    },
    [navigate]
  );

  const handleLinkClick = useCallback(
    (linkDetailPayload) => {
      const { id, sourceNode, targetNode } = linkDetailPayload;
      const tabExists = openLinkTabs.some((tab) => tab.id === id);

      if (!tabExists) {
        const newTab = {
          id: id,
          title: `${sourceNode} - ${targetNode}`,
          type: "link",
          data: linkDetailPayload,
        };
        setOpenLinkTabs((prevTabs) => [...prevTabs, newTab]);
      }
      setActiveLinkTabId(id);
    },
    [openLinkTabs]
  );

  const handleCloseTab = useCallback(
    (tabIdToClose) => {
      setOpenLinkTabs((prevTabs) => {
        const remainingTabs = prevTabs.filter((tab) => tab.id !== tabIdToClose);
        if (activeLinkTabId === tabIdToClose) {
          setActiveLinkTabId(
            remainingTabs.length > 0
              ? remainingTabs[remainingTabs.length - 1].id
              : null
          );
        }
        return remainingTabs;
      });
    },
    [activeLinkTabId]
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* 1. Link Detail Tabs */}
      {openLinkTabs.length > 0 && (
        <div className="flex-shrink-0">
          <LinkDetailTabs
            tabs={openLinkTabs}
            activeTabId={activeLinkTabId}
            onSetActiveTab={setActiveLinkTabId}
            onCloseTab={handleCloseTab}
            theme={theme}
          />
        </div>
      )}

      {/* 2. Network Visualizer (passing transformed data) */}
      <div className="flex-grow relative">
        <NetworkVisualizer
          data={graphData} // Pass the transformed graphData
          theme={theme}
          onZoneClick={handleZoneClick}
          onLinkClick={handleLinkClick}
          onNodeClick={handleNodeClick}
        />
      </div>
    </div>
  );
};

export default NetworkVisualizerWrapper;
