import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import NetworkVisualizer from "./chart/NetworkVisualizer";
import LinkDetailTabs from "./LinkDetailTabs";

const NetworkVisualizerWrapper = ({ data, theme }) => {
  const navigate = useNavigate();

  // --- State reverted to ONLY manage LINK tabs ---
  const [openLinkTabs, setOpenLinkTabs] = useState([]);
  const [activeLinkTabId, setActiveLinkTabId] = useState(null);

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
        <NetworkVisualizer
          data={data}
          theme={theme}
          onZoneClick={handleZoneClick}
          onLinkClick={handleLinkClick}
          onNodeClick={handleNodeClick} // This now correctly triggers navigation
        />
      </div>
    </div>
  );
};

export default NetworkVisualizerWrapper;
