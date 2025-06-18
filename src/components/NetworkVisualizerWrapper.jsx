// src/NetworkVisualizerWrapper.jsx
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import NetworkVisualizer from "./chart/NetworkVisualizer";
// REMOVED: usePopupManager and SiteDetailPopup
import LinkDetailTabs from "./LinkDetailTabs"; // IMPORT the new component

const NetworkVisualizerWrapper = ({ data, theme }) => {
  const navigate = useNavigate();

  // --- NEW STATE MANAGEMENT FOR TABS ---
  const [openLinkTabs, setOpenLinkTabs] = useState([]);
  const [activeLinkTabId, setActiveLinkTabId] = useState(null);

  // The handleZoneClick and handleNodeClick functions remain the same
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

  // --- MODIFIED handleLinkClick ---
  const handleLinkClick = useCallback(
    (linkDetailPayload) => {
      const { id, sourceNode, targetNode } = linkDetailPayload;

      // Check if a tab for this link already exists
      const tabExists = openLinkTabs.some((tab) => tab.id === id);

      if (!tabExists) {
        // If not, add a new tab
        const newTab = {
          id: id,
          title: `${sourceNode} - ${targetNode}`,
          data: linkDetailPayload,
        };
        setOpenLinkTabs((prevTabs) => [...prevTabs, newTab]);
      }

      // Set the clicked link's tab as active
      setActiveLinkTabId(id);
    },
    [openLinkTabs] // Dependency on openLinkTabs to check for existence
  );

  // --- NEW handler to close a tab ---
  const handleCloseTab = useCallback(
    (tabIdToClose) => {
      setOpenLinkTabs((prevTabs) => {
        const remainingTabs = prevTabs.filter((tab) => tab.id !== tabIdToClose);

        // If the closed tab was the active one, update the active tab
        if (activeLinkTabId === tabIdToClose) {
          if (remainingTabs.length > 0) {
            // Make the last tab in the list the new active one
            setActiveLinkTabId(remainingTabs[remainingTabs.length - 1].id);
          } else {
            // No tabs left, so no active tab
            setActiveLinkTabId(null);
          }
        }
        return remainingTabs;
      });
    },
    [activeLinkTabId]
  );

  return (
    // --- LAYOUT CHANGE IS HERE ---
    // Use flexbox to structure the layout vertically.
    // The container takes up the full height.
    <div className="w-full h-full flex flex-col">
      {/* 1. Link Detail Tabs (rendered at the top if there are any) */}
      {openLinkTabs.length > 0 && (
        <div className="flex-shrink-0">
          {" "}
          {/* This div prevents the tabs from shrinking */}
          <LinkDetailTabs
            tabs={openLinkTabs}
            activeTabId={activeLinkTabId}
            onSetActiveTab={setActiveLinkTabId}
            onCloseTab={handleCloseTab}
            theme={theme}
          />
        </div>
      )}

      {/* 2. Network Visualizer (takes up the remaining space) */}
      <div className="flex-grow relative">
        {" "}
        {/* This div grows to fill the rest of the height */}
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
