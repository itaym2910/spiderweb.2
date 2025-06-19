// src/components/LinkDetailTabs.jsx
import React, { useState, useEffect } from "react";
import { MdClose, MdArrowForward } from "react-icons/md"; // Import new icon

// ... (StatusBulb and DetailItem helper components remain the same) ...
const StatusBulb = ({ status }) => {
  let bgColor = "bg-gray-400 dark:bg-gray-500";
  if (status === "up") bgColor = "bg-green-500 dark:bg-green-400";
  else if (status === "down") bgColor = "bg-red-500 dark:bg-red-400";
  else if (status === "issue") bgColor = "bg-yellow-500 dark:bg-yellow-400";
  return (
    <div className={`w-3.5 h-3.5 rounded-full ${bgColor} flex-shrink-0`}></div>
  );
};

const DetailItem = ({ label, value, isDark }) => (
  <div>
    <p
      className={`text-xs uppercase tracking-wider ${
        isDark ? "text-gray-400" : "text-gray-500"
      }`}
    >
      {label}
    </p>
    <p className={`text-base ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      {value || "N/A"}
    </p>
  </div>
);

// --- Main Component ---
const LinkDetailTabs = ({
  tabs,
  activeTabId,
  onSetActiveTab,
  onCloseTab,
  onNavigateToSite, // NEW PROP for site navigation
  theme,
}) => {
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  useEffect(() => {
    setIsDetailExpanded(false);
  }, [activeTabId]);

  if (!activeTab) {
    return null;
  }

  const handleClose = (e, tabId) => {
    e.stopPropagation();
    onCloseTab(tabId);
  };

  const handleNavigate = () => {
    if (onNavigateToSite && activeTab.type === "site") {
      onNavigateToSite(activeTab.data);
    }
  };

  const isDark = theme === "dark";
  const itemData = activeTab.data;
  const itemType = activeTab.type;

  return (
    <div className="relative bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 shadow-md z-20">
      {/* 1. Tab Bar */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSetActiveTab(tab.id)}
            className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 -mb-px
              ${
                activeTabId === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            <span>{tab.title}</span>
            <span
              onClick={(e) => handleClose(e, tab.id)}
              className="ml-3 p-0.5 rounded-full hover:bg-red-200 dark:hover:bg-red-800"
            >
              <MdClose size={16} />
            </span>
          </button>
        ))}
      </div>

      {/* 2. Content for the Active Tab */}
      <div className="p-4">
        {/* --- A. LINK TYPE CONTENT --- */}
        {itemType === "link" && (
          <>
            {/* Clickable Summary Row for Links */}
            <div
              className={`flex items-center space-x-6 p-3 rounded-md cursor-pointer transition-colors ${
                isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } ${
                isDetailExpanded ? (isDark ? "bg-gray-700" : "bg-gray-100") : ""
              }`}
              onClick={() => setIsDetailExpanded(!isDetailExpanded)}
            >
              <StatusBulb status={itemData.status} />
              <div className="flex-1 font-medium text-gray-800 dark:text-gray-100">
                {itemData.name || "Unnamed Link"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {itemData.linkBandwidth}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Latency: {itemData.latency}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Utilization: {itemData.utilization}
              </div>
            </div>
            {/* Hidden/Revealed Detail Row for Links */}
            {isDetailExpanded && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 p-4 mt-2 border-t border-gray-200 dark:border-gray-600">
                <DetailItem
                  label="Link ID"
                  value={itemData.linkId}
                  isDark={isDark}
                />
                <DetailItem
                  label="Description"
                  value={itemData.linkDescription}
                  isDark={isDark}
                />
                <DetailItem
                  label="Source Interface"
                  value={itemData.sourceInterface}
                  isDark={isDark}
                />
                <DetailItem
                  label="Target Interface"
                  value={itemData.targetInterface}
                  isDark={isDark}
                />
              </div>
            )}
          </>
        )}

        {/* --- B. SITE TYPE CONTENT --- */}
        {itemType === "site" && (
          <>
            {/* Summary Row for Sites */}
            <div className="flex items-center justify-between p-3 rounded-md">
              <div className="flex items-center space-x-4">
                <StatusBulb
                  status={itemData.protocolStatus === "Up" ? "up" : "down"}
                />
                <div className="flex-1 font-medium text-gray-800 dark:text-gray-100">
                  {itemData.name || "Unnamed Site"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  OSPF: {itemData.ospfStatus}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  MPLS: {itemData.mplsStatus}
                </div>
              </div>
              {/* Special Navigation Button */}
              <button
                onClick={handleNavigate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
              >
                Go to Site Details
                <MdArrowForward />
              </button>
            </div>
            {/* Detail section for Sites (always visible) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 p-4 mt-2 border-t border-gray-200 dark:border-gray-600">
              <DetailItem
                label="Description"
                value={itemData.description}
                isDark={isDark}
              />
              <DetailItem
                label="Media Type"
                value={itemData.mediaType}
                isDark={isDark}
              />
              <DetailItem
                label="CDP Neighbors"
                value={itemData.cdpNeighbors}
                isDark={isDark}
              />
              <DetailItem
                label="Container Name"
                value={itemData.containerName}
                isDark={isDark}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LinkDetailTabs;
