// LinkTable.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LinkDetailRow from "./LineDetailExtend";

const StatusBulb = ({ status }) => {
  let bgColor = "bg-gray-400 dark:bg-gray-500";
  let title = "Unknown";
  if (status === "up") {
    bgColor = "bg-green-500 dark:bg-green-400";
    title = "Up";
  } else if (status === "down") {
    bgColor = "bg-red-500 dark:bg-red-400";
    title = "Down";
  } else if (status === "issue") {
    bgColor = "bg-yellow-500 dark:bg-yellow-400";
    title = "Issue";
  }
  return (
    <div
      className={`w-4 h-4 rounded-full ${bgColor} flex-shrink-0`}
      title={title}
    ></div>
  );
};

const LinkTable = ({
  coreDeviceName,
  coreSiteName = "Unknown Site",
  linksData = [],
  otherDevicesInZone = [],
  theme = "dark",
}) => {
  const navigate = useNavigate();

  const [linkTypeFilter, setLinkTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredLinks, setFilteredLinks] = useState(linksData);
  const [expandedLinkId, setExpandedLinkId] = useState(null);

  useEffect(() => {
    let currentLinks = [...linksData];
    if (linkTypeFilter !== "all") {
      currentLinks = currentLinks.filter(
        (link) => link && link.type === linkTypeFilter
      );
    }
    if (statusFilter === "issue") {
      const problemLinks = currentLinks.filter(
        (link) => link && (link.status === "down" || link.status === "issue")
      );
      problemLinks.sort((a, b) => {
        if (a.status === "down" && b.status !== "down") return -1;
        if (a.status !== "down" && b.status === "down") return 1;
        return 0;
      });
      currentLinks = problemLinks;
    } else if (statusFilter !== "all") {
      currentLinks = currentLinks.filter(
        (link) => link && link.status === statusFilter
      );
    }
    setFilteredLinks(currentLinks);
  }, [linksData, linkTypeFilter, statusFilter]);

  const isDark = theme === "dark";

  const handleLinkRowClick = (linkId) => {
    setExpandedLinkId((prevId) => (prevId === linkId ? null : linkId));
  };

  const handleDeviceButtonClick = (device) => {
    navigate(`/l-chart/zone/${device.zoneName}/node/${device.hostname}`);
  };

  const actionButtonBaseClasses =
    "ml-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50";
  const actionButtonSizeClasses = "px-4 py-1.5 text-sm";
  const lightActionButtonClasses =
    "bg-blue-100 hover:bg-blue-200 text-blue-700 focus:ring-blue-500";
  const darkActionButtonClasses =
    "bg-blue-700 hover:bg-blue-600 text-blue-100 focus:ring-blue-400";

  return (
    // [THE FIX] - The root div now has `min-h-full` to ensure it stretches to fill the viewport,
    // which allows its parent's scrollbar to activate when this component's content is too tall.
    <div className="min-h-full">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {coreSiteName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Core Site Device Details
          </p>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mr-2">
              Links for: {coreDeviceName || "N/A"}
            </h2>
            {otherDevicesInZone.length > 0 &&
              otherDevicesInZone.map((device) => (
                <button
                  key={device.id}
                  onClick={() => handleDeviceButtonClick(device)}
                  className={`${actionButtonBaseClasses} ${actionButtonSizeClasses} ${
                    isDark ? darkActionButtonClasses : lightActionButtonClasses
                  }`}
                  aria-label={`View details for ${device.hostname}`}
                  title={`View details for ${device.hostname}`}
                >
                  {device.hostname}
                </button>
              ))}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="linkTypeFilter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by Link Type:
            </label>
            <select
              id="linkTypeFilter"
              value={linkTypeFilter}
              onChange={(e) => setLinkTypeFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Link Types</option>
              <option value="core-to-site">Core to Site</option>
              <option value="inter-core-different-site">
                Inter-Core (Different Site)
              </option>
              <option value="inter-core-same-site">
                Inter-Core (Same Site)
              </option>
            </select>
          </div>
          <div>
            <label
              htmlFor="statusFilter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="issue">Issue</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  OSPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  MPLS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Bandwidth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLinks && filteredLinks.length > 0 ? (
                filteredLinks.flatMap((link) => {
                  if (!link || typeof link.id === "undefined") {
                    console.warn(
                      "Encountered an invalid link object in LinkTable:",
                      link
                    );
                    return null;
                  }
                  const isSelected = expandedLinkId === link.id;
                  const selectedRowBg = isDark
                    ? "bg-slate-700"
                    : "bg-slate-100";
                  return (
                    <React.Fragment key={link.id}>
                      <tr
                        className={`hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          isSelected ? selectedRowBg : ""
                        }`}
                        onClick={() => handleLinkRowClick(link.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBulb status={link.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {link.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {link.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {link.ospfStatus || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {link.mplsStatus || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {link.bandwidth}
                        </td>
                      </tr>
                      {isSelected && (
                        <tr className="border-l-4 border-blue-500 dark:border-blue-400">
                          <LinkDetailRow
                            link={link}
                            isParentSelectedAndDark={isDark}
                          />
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No links match filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {linksData.length > 0 && filteredLinks.length === 0 && (
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No links match the current filters. Try adjusting your selection.
          </p>
        )}
        {linksData.length === 0 && (
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No link data provided.
          </p>
        )}
      </div>
    </div>
  );
};

export default LinkTable;
