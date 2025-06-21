import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import NetworkVisualizer from "./chart/NetworkVisualizer";
import LinkDetailTabs from "./LinkDetailTabs";

const NetworkVisualizerWrapper = ({ data, theme }) => {
  const navigate = useNavigate();

  // --- RENAMED STATE to handle both links and sites ---
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  const handleZoneClick = useCallback(
    (zoneId) => {
      navigate(`zone/${zoneId}`);
    },
    [navigate]
  );

  // --- MODIFIED handleNodeClick to open a tab ---
  const handleNodeClick = useCallback(
    (nodeData) => {
      if (!nodeData || !nodeData.id) {
        console.warn("Node data incomplete for tab creation:", nodeData);
        return;
      }

      const tabExists = openTabs.some((tab) => tab.id === nodeData.id);

      if (!tabExists) {
        const newTab = {
          id: nodeData.id,
          title: nodeData.name || "Unnamed Site",
          type: "site", // <-- Explicitly set the type to 'site'
          data: nodeData,
        };
        setOpenTabs((prevTabs) => [...prevTabs, newTab]);
      }
      setActiveTabId(nodeData.id);
    },
    [openTabs]
  );

  // --- MODIFIED handleLinkClick to use new state ---
  const handleLinkClick = useCallback(
    (linkDetailPayload) => {
      const { id, sourceNode, targetNode } = linkDetailPayload;
      const tabExists = openTabs.some((tab) => tab.id === id);

      if (!tabExists) {
        const newTab = {
          id: id,
          title: `${sourceNode} - ${targetNode}`,
          type: "link", // <-- Explicitly set the type to 'link'
          data: linkDetailPayload,
        };
        setOpenTabs((prevTabs) => [...prevTabs, newTab]);
      }
      setActiveTabId(id);
    },
    [openTabs]
  );

  // --- MODIFIED handler to close a tab ---
  const handleCloseTab = useCallback(
    (tabIdToClose) => {
      setOpenTabs((prevTabs) => {
        const remainingTabs = prevTabs.filter((tab) => tab.id !== tabIdToClose);

        if (activeTabId === tabIdToClose) {
          if (remainingTabs.length > 0) {
            setActiveTabId(remainingTabs[remainingTabs.length - 1].id);
          } else {
            setActiveTabId(null);
          }
        }
        return remainingTabs;
      });
    },
    [activeTabId]
  );

  // NEW: Handler for the "Go to Site Details" button
  const handleNavigateToSite = useCallback(
    (siteData) => {
      if (siteData && siteData.id && siteData.zone) {
        navigate(`zone/${siteData.zone}/node/${siteData.id}`);
      }
    },
    [navigate]
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* 1. Link Detail Tabs (now using unified state) */}
      {openTabs.length > 0 && (
        <div className="flex-shrink-0">
          <LinkDetailTabs
            tabs={openTabs}
            activeTabId={activeTabId}
            onSetActiveTab={setActiveTabId}
            onCloseTab={handleCloseTab}
            onNavigateToSite={handleNavigateToSite} // Pass the navigation handler
            theme={theme}
          />
        </div>
      )}

      {/* 2. Network Visualizer */}
      <div className="flex-grow relative">
        <NetworkVisualizer
          data={data}
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
