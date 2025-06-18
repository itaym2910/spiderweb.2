// src/components/LinkDetailTabs.jsx
import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

// Re-usable components for consistency with your other UI
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

const LinkDetailTabs = ({
  tabs,
  activeTabId,
  onSetActiveTab,
  onCloseTab,
  theme,
}) => {
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);

  // Find the data for the currently active tab
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  // When the user switches tabs, collapse the detail view
  useEffect(() => {
    setIsDetailExpanded(false);
  }, [activeTabId]);

  if (!activeTab) {
    return null; // Don't render anything if there's no active tab
  }

  const handleClose = (e, tabId) => {
    e.stopPropagation(); // Prevent the tab from being selected when closing
    onCloseTab(tabId);
  };

  const isDark = theme === "dark";
  const linkData = activeTab.data; // The full data payload for the link

  return (
    // CHANGE IS HERE: Replaced 'absolute bottom-0' with 'relative' and added z-index.
    // The parent will now control the layout.
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

      {/* 2. Content for the Active Tab (no changes needed here) */}
      <div className="p-4">
        {/* Clickable Summary Row */}
        <div
          className={`flex items-center space-x-6 p-3 rounded-md cursor-pointer transition-colors ${
            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          } ${
            isDetailExpanded ? (isDark ? "bg-gray-700" : "bg-gray-100") : ""
          }`}
          onClick={() => setIsDetailExpanded(!isDetailExpanded)}
        >
          <StatusBulb status={linkData.status} />
          <div className="flex-1 font-medium text-gray-800 dark:text-gray-100">
            {linkData.name || "Unnamed Link"}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {linkData.linkBandwidth}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Latency: {linkData.latency}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Utilization: {linkData.utilization}
          </div>
        </div>

        {/* Hidden/Revealed Detail Row */}
        {isDetailExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 p-4 mt-2 border-t border-gray-200 dark:border-gray-600">
            <DetailItem
              label="Link ID"
              value={linkData.linkId}
              isDark={isDark}
            />
            <DetailItem
              label="Description"
              value={linkData.linkDescription}
              isDark={isDark}
            />
            <DetailItem
              label="Source Interface"
              value={linkData.sourceInterface}
              isDark={isDark}
            />
            <DetailItem
              label="Target Interface"
              value={linkData.targetInterface}
              isDark={isDark}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkDetailTabs;
