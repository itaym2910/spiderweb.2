import React, { useState, useEffect } from "react";
import { MdClose, MdArrowForward } from "react-icons/md";

/**
 * A reusable status indicator bulb.
 * @param {{ status: 'up' | 'down' | 'issue' | string }} props
 */
const StatusBulb = ({ status }) => {
  let bgColor = "bg-gray-400 dark:bg-gray-500";
  if (status === "up") bgColor = "bg-green-500 dark:bg-green-400";
  else if (status === "down") bgColor = "bg-red-500 dark:bg-red-400";
  else if (status === "issue") bgColor = "bg-yellow-500 dark:bg-yellow-400";

  return (
    <div className={`w-3.5 h-3.5 rounded-full ${bgColor} flex-shrink-0`}></div>
  );
};

// NOTE: This helper component is no longer used but is kept in case of future need.
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

/**
 * A tabbed interface to display details for network links and sites.
 * It supports multiple tabs, closing tabs, and different layouts for each item type.
 */
const LinkDetailTabs = ({
  tabs,
  activeTabId,
  onSetActiveTab,
  onCloseTab,
  onNavigateToSite,
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

  const handleNavigate = (e) => {
    e.stopPropagation();
    if (onNavigateToSite && activeTab.type === "site") {
      onNavigateToSite(activeTab.data);
    }
  };

  const isDark = theme === "dark";
  const itemData = activeTab.data;
  const itemType = activeTab.type;

  return (
    <div className="relative bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 shadow-md z-20">
      {/* 1. Tab Bar (Unchanged) */}
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
              className="ml-3 p-0.5 rounded-full hover:bg-red-200 dark:hover:bg-red-800 cursor-pointer"
            >
              <MdClose size={16} />
            </span>
          </button>
        ))}
      </div>

      {/* 2. Content for the Active Tab */}
      <div className="p-4">
        {/* --- A. LINK TYPE CONTENT (Unchanged) --- */}
        {itemType === "link" && itemData && (
          <>
            <div
              className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } ${
                isDetailExpanded ? (isDark ? "bg-gray-700" : "bg-gray-100") : ""
              }`}
              onClick={() => setIsDetailExpanded(!isDetailExpanded)}
            >
              <div className="flex items-center space-x-4">
                <StatusBulb status={itemData.status} />
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {itemData.name || "Unnamed Link"}
                </p>
              </div>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Physical:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Up
                </span>
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Protocol:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Up
                </span>
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                MPLS:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Enabled
                </span>
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                OSPF:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Full
                </span>
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Bandwidth:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  10 Gbps
                </span>
              </p>
            </div>
            {isDetailExpanded && (
              <div className="flex flex-row flex-wrap justify-between items-center gap-y-2 p-4 mt-2 border-t border-gray-200 dark:border-gray-600">
                <div>
                  <span className="text-base text-gray-500 dark:text-gray-400 mr-2">
                    Description:
                  </span>
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    Core fiber link
                  </span>
                </div>
                <div>
                  <span className="text-base text-gray-500 dark:text-gray-400 mr-2">
                    Media Type:
                  </span>
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    Fiber Optic
                  </span>
                </div>
                <div>
                  <span className="text-base text-gray-500 dark:text-gray-400 mr-2">
                    CDP Neighbors:
                  </span>
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    2
                  </span>
                </div>
                <div>
                  <span className="text-base text-gray-500 dark:text-gray-400 mr-2">
                    TX:
                  </span>
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    8.2 Gbps
                  </span>
                </div>
                <div>
                  <span className="text-base text-gray-500 dark:text-gray-400 mr-2">
                    RX:
                  </span>
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    7.1 Gbps
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* --- B. SITE TYPE CONTENT --- */}
        {itemType === "site" && itemData && (
          <>
            <div
              className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } ${
                isDetailExpanded ? (isDark ? "bg-gray-700" : "bg-gray-100") : ""
              }`}
              onClick={() => setIsDetailExpanded(!isDetailExpanded)}
            >
              <div className="flex items-center space-x-4">
                <StatusBulb
                  status={itemData.protocolStatus === "Up" ? "up" : "down"}
                />
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {itemData.name || "Unnamed Site"}
                </p>
              </div>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Physical:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Up
                </span>
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Protocol:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {itemData.protocolStatus}
                </span>
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                MPLS:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {itemData.mplsStatus}
                </span>
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                OSPF:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {itemData.ospfStatus}
                </span>
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Bandwidth:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  100 Gbps
                </span>
              </p>
              <button
                onClick={handleNavigate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
              >
                Go to Site Details
                <MdArrowForward />
              </button>
            </div>

            {/* START: MODIFIED Detail section for Sites */}
            {isDetailExpanded && (
              <div className="flex flex-row flex-wrap justify-between items-center gap-y-2 p-4 mt-2 border-t border-gray-200 dark:border-gray-600">
                <div>
                  <span className="text-base text-gray-500 dark:text-gray-400 mr-2">
                    Description:
                  </span>
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    {itemData.description || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-base text-gray-500 dark:text-gray-400 mr-2">
                    Media Type:
                  </span>
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    {itemData.mediaType || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-base text-gray-500 dark:text-gray-400 mr-2">
                    CDP Neighbors:
                  </span>
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    {itemData.cdpNeighbors || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-base text-gray-500 dark:text-gray-400 mr-2">
                    TX:
                  </span>
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    98.5 Gbps
                  </span>
                </div>
                <div>
                  <span className="text-base text-gray-500 dark:text-gray-400 mr-2">
                    RX:
                  </span>
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    95.1 Gbps
                  </span>
                </div>
              </div>
            )}
            {/* END: MODIFIED Detail section */}
          </>
        )}
      </div>
    </div>
  );
};

export default LinkDetailTabs;
