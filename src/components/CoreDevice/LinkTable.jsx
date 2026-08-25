// LinkTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Server,
  Activity,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  Link2,
  Cpu,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
  Network,
} from "lucide-react";
import LinkDetailRow from "./LineDetailExtend";

// ─── Status Badge Component ───
const StatusBadge = ({ status, size = "sm" }) => {
  const config = {
    Up: {
      bg: "bg-emerald-500/15 dark:bg-emerald-400/15",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500 dark:bg-emerald-400",
      label: "Up",
    },
    Down: {
      bg: "bg-red-500/15 dark:bg-red-400/15",
      text: "text-red-700 dark:text-red-400",
      dot: "bg-red-500 dark:bg-red-400",
      label: "Down",
    },
    up: {
      bg: "bg-emerald-500/15 dark:bg-emerald-400/15",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500 dark:bg-emerald-400",
      label: "Up",
    },
    down: {
      bg: "bg-red-500/15 dark:bg-red-400/15",
      text: "text-red-700 dark:text-red-400",
      dot: "bg-red-500 dark:bg-red-400",
      label: "Down",
    },
    issue: {
      bg: "bg-amber-500/15 dark:bg-amber-400/15",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500 dark:bg-amber-400",
      label: "Issue",
    },
    "N/A": {
      bg: "bg-gray-500/10 dark:bg-gray-400/10",
      text: "text-gray-500 dark:text-gray-400",
      dot: "bg-gray-400 dark:bg-gray-500",
      label: "N/A",
    },
  };

  const c = config[status] || config["N/A"];
  const sizeClasses =
    size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${c.bg} ${c.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {c.label}
    </span>
  );
};

// ─── Summary Stat Card ───
const StatCard = ({ icon: Icon, label, value, color, subValue }) => {
  const colorMap = {
    blue: {
      bg: "bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10",
      border: "border-blue-200/50 dark:border-blue-500/20",
      icon: "text-blue-600 dark:text-blue-400",
      value: "text-blue-700 dark:text-blue-300",
    },
    green: {
      bg: "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10",
      border: "border-emerald-200/50 dark:border-emerald-500/20",
      icon: "text-emerald-600 dark:text-emerald-400",
      value: "text-emerald-700 dark:text-emerald-300",
    },
    red: {
      bg: "bg-gradient-to-br from-red-500/10 to-red-600/5 dark:from-red-500/20 dark:to-red-600/10",
      border: "border-red-200/50 dark:border-red-500/20",
      icon: "text-red-600 dark:text-red-400",
      value: "text-red-700 dark:text-red-300",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10",
      border: "border-purple-200/50 dark:border-purple-500/20",
      icon: "text-purple-600 dark:text-purple-400",
      value: "text-purple-700 dark:text-purple-300",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10",
      border: "border-amber-200/50 dark:border-amber-500/20",
      icon: "text-amber-600 dark:text-amber-400",
      value: "text-amber-700 dark:text-amber-300",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`rounded-xl border ${c.border} ${c.bg} p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg bg-white/60 dark:bg-white/5 ${c.icon}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-2xl font-bold ${c.value} leading-tight`}>
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {subValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Filter Pill Button ───
const FilterPill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 border ${
      active
        ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-sm"
        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
    }`}
  >
    {children}
  </button>
);

// ─── Main LinkTable Component ───
const LinkTable = ({
  coreDeviceName,
  coreSiteName = "Unknown Site",
  linksData = [],
  otherDevicesInZone = [],
  theme = "dark",
  chartType = "L",
  interfaces = [],
  currentDevice = null,
}) => {
  const navigate = useNavigate();

  // Links state
  const [linkTypeFilter, setLinkTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredLinks, setFilteredLinks] = useState(linksData);
  const [expandedLinkId, setExpandedLinkId] = useState(null);

  // Interfaces state
  const [interfaceStatusFilter, setInterfaceStatusFilter] = useState("all");
  const [expandedSection, setExpandedSection] = useState({
    interfaces: true,
    links: true,
  });

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

  // Filter interfaces
  const filteredInterfaces = useMemo(() => {
    if (!interfaces || interfaces.length === 0) return [];
    if (interfaceStatusFilter === "all") return interfaces;
    return interfaces.filter((iface) => {
      const status = (iface.physical_status || "").toLowerCase();
      return status === interfaceStatusFilter;
    });
  }, [interfaces, interfaceStatusFilter]);

  // Compute stats
  const stats = useMemo(() => {
    const totalIfaces = interfaces.length;
    const ifacesUp = interfaces.filter(
      (i) => (i.physical_status || "").toLowerCase() === "up"
    ).length;
    const ifacesDown = totalIfaces - ifacesUp;
    const totalLinks = linksData.length;
    const linksUp = linksData.filter((l) => l.status === "up").length;
    const linksDown = linksData.filter((l) => l.status === "down").length;
    const linksIssue = linksData.filter((l) => l.status === "issue").length;
    return {
      totalIfaces,
      ifacesUp,
      ifacesDown,
      totalLinks,
      linksUp,
      linksDown,
      linksIssue,
    };
  }, [interfaces, linksData]);

  const isDark = theme === "dark";

  const handleLinkRowClick = (linkId) => {
    setExpandedLinkId((prevId) => (prevId === linkId ? null : linkId));
  };

  const handleDeviceButtonClick = (device) => {
    const basePath = chartType === "P" ? "/p-chart" : "/l-chart";
    navigate(`${basePath}/zone/${device.zoneName}/node/${device.hostname}`);
  };

  const handleBackClick = () => {
    const basePath = chartType === "P" ? "/p-chart" : "/l-chart";
    navigate(`${basePath}/zone/${coreSiteName}`);
  };

  const toggleSection = (section) => {
    setExpandedSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-full p-2 sm:p-4">
      {/* ─── Header ─── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBackClick}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200"
            title="Back to site view"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Network className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{coreSiteName}</span>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-gray-800 dark:text-gray-200 font-medium truncate">
                {coreDeviceName || "N/A"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">
              Device Details
            </h1>
          </div>
        </div>

        {/* Device Info + Sibling Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          {currentDevice && (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm">
              <Server className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300 font-mono">
                {currentDevice.ip_address || "\u2014"}
              </span>
            </div>
          )}

          {otherDevicesInZone.length > 0 && (
            <>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Switch to:
              </span>
              {otherDevicesInZone.map((device) => (
                <button
                  key={device.id}
                  onClick={() => handleDeviceButtonClick(device)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200"
                  title={`View ${device.hostname}`}
                >
                  <Cpu className="w-3 h-3" />
                  {device.hostname}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ─── Summary Stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard
          icon={Cpu}
          label="Interfaces"
          value={stats.totalIfaces}
          color="blue"
        />
        <StatCard
          icon={ArrowUpCircle}
          label="Interfaces Up"
          value={stats.ifacesUp}
          color="green"
          subValue={
            stats.totalIfaces > 0
              ? `${Math.round((stats.ifacesUp / stats.totalIfaces) * 100)}%`
              : undefined
          }
        />
        <StatCard
          icon={ArrowDownCircle}
          label="Interfaces Down"
          value={stats.ifacesDown}
          color="red"
        />
        <StatCard
          icon={Link2}
          label="Total Links"
          value={stats.totalLinks}
          color="purple"
        />
        <StatCard
          icon={AlertTriangle}
          label="Link Issues"
          value={stats.linksDown + stats.linksIssue}
          color="amber"
        />
      </div>

      {/* ─── Interfaces Section ─── */}
      <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm mb-6 overflow-hidden">
        <button
          onClick={() => toggleSection("interfaces")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Device Interfaces
            </h3>
            <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {filteredInterfaces.length}
              {interfaceStatusFilter !== "all" &&
                ` / ${interfaces.length}`}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              expandedSection.interfaces ? "rotate-0" : "-rotate-90"
            }`}
          />
        </button>

        {expandedSection.interfaces && (
          <div className="px-5 pb-5">
            {/* Interface Filters */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/50">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">
                Status:
              </span>
              <FilterPill
                active={interfaceStatusFilter === "all"}
                onClick={() => setInterfaceStatusFilter("all")}
              >
                All
              </FilterPill>
              <FilterPill
                active={interfaceStatusFilter === "up"}
                onClick={() => setInterfaceStatusFilter("up")}
              >
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Up
                </span>
              </FilterPill>
              <FilterPill
                active={interfaceStatusFilter === "down"}
                onClick={() => setInterfaceStatusFilter("down")}
              >
                <span className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Down
                </span>
              </FilterPill>
            </div>

            {/* Interfaces Table */}
            {filteredInterfaces.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700/50">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700/50">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-700/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Interface
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        BW / MTU
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Media
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        CDP Neighbor
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        OSPF
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        MPLS
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        TX / RX
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        CRC Errors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
                    {filteredInterfaces.map((iface, index) => {
                      const physStatus = iface.physical_status || "N/A";
                      const protoStatus = iface.protocol_status || "N/A";
                      const crcVal = iface.crc ?? "N/A";
                      const hasCrcErrors =
                        typeof crcVal === "number" && crcVal > 0;

                      return (
                        <tr
                          key={iface.id || index}
                          className="hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors duration-150"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <StatusBadge status={physStatus} />
                              {protoStatus !== physStatus && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                  Proto: {protoStatus}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">
                              {iface.name || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {iface.description || "\u2014"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm">
                              <span className="text-gray-800 dark:text-gray-200 font-medium">
                                {iface.bandwidth
                                  ? `${iface.bandwidth >= 1000 ? `${iface.bandwidth / 1000}G` : `${iface.bandwidth}M`}`
                                  : "N/A"}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500 mx-1">
                                /
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {iface.mtu || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {iface.media_type || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                              {iface.cdp || "\u2014"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded ${
                                iface.ospf === "Enabled"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                              }`}
                            >
                              {iface.ospf || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded ${
                                iface.mpls === "Enabled"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                              }`}
                            >
                              {iface.mpls || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="text-sm font-mono">
                              <span className="text-gray-600 dark:text-gray-400">
                                {iface.tx ?? "N/A"}
                              </span>
                              <span className="text-gray-300 dark:text-gray-600 mx-1">
                                /
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {iface.rx ?? "N/A"}
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                                dBm
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span
                              className={`text-sm font-mono ${
                                hasCrcErrors
                                  ? "text-red-600 dark:text-red-400 font-semibold"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {crcVal}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                <Activity className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {interfaces.length === 0
                    ? "No interface data available for this device."
                    : "No interfaces match the current filter."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Links Section ─── */}
      <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection("links")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 dark:bg-purple-400/10">
              <Link2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Network Links
            </h3>
            <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {filteredLinks.length}
              {(linkTypeFilter !== "all" || statusFilter !== "all") &&
                ` / ${linksData.length}`}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              expandedSection.links ? "rotate-0" : "-rotate-90"
            }`}
          />
        </button>

        {expandedSection.links && (
          <div className="px-5 pb-5">
            {/* Link Filters */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Type:
                </span>
                <FilterPill
                  active={linkTypeFilter === "all"}
                  onClick={() => setLinkTypeFilter("all")}
                >
                  All
                </FilterPill>
                <FilterPill
                  active={linkTypeFilter === "core-to-site"}
                  onClick={() => setLinkTypeFilter("core-to-site")}
                >
                  Core \u2192 Site
                </FilterPill>
                <FilterPill
                  active={linkTypeFilter === "inter-core-different-site"}
                  onClick={() =>
                    setLinkTypeFilter("inter-core-different-site")
                  }
                >
                  Inter-Core (Diff)
                </FilterPill>
                <FilterPill
                  active={linkTypeFilter === "inter-core-same-site"}
                  onClick={() => setLinkTypeFilter("inter-core-same-site")}
                >
                  Inter-Core (Same)
                </FilterPill>
              </div>
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Status:
                </span>
                <FilterPill
                  active={statusFilter === "all"}
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </FilterPill>
                <FilterPill
                  active={statusFilter === "up"}
                  onClick={() => setStatusFilter("up")}
                >
                  Up
                </FilterPill>
                <FilterPill
                  active={statusFilter === "down"}
                  onClick={() => setStatusFilter("down")}
                >
                  Down
                </FilterPill>
                <FilterPill
                  active={statusFilter === "issue"}
                  onClick={() => setStatusFilter("issue")}
                >
                  Issues
                </FilterPill>
              </div>
            </div>

            {/* Links Table */}
            {filteredLinks && filteredLinks.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700/50">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700/50">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-700/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        OSPF
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        MPLS
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Bandwidth
                      </th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
                    {filteredLinks.flatMap((link) => {
                      if (!link || typeof link.id === "undefined") {
                        return null;
                      }
                      const isSelected = expandedLinkId === link.id;
                      return (
                        <React.Fragment key={link.id}>
                          <tr
                            className={`cursor-pointer transition-colors duration-150 ${
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-500/10"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700/20"
                            }`}
                            onClick={() => handleLinkRowClick(link.id)}
                          >
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <StatusBadge status={link.status} />
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {link.name}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {link.description}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-center">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded ${
                                  link.ospfStatus === "Enabled"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                                }`}
                              >
                                {link.ospfStatus || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-center">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded ${
                                  link.mplsStatus === "Enabled"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                                }`}
                              >
                                {link.mplsStatus || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                {link.bandwidth || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                  isSelected ? "rotate-180" : ""
                                }`}
                              />
                            </td>
                          </tr>
                          {isSelected && (
                            <tr>
                              <LinkDetailRow
                                link={link}
                                isParentSelectedAndDark={isDark}
                              />
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                <Link2 className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {linksData.length === 0
                    ? "No link data available for this device."
                    : "No links match the current filters."}
                </p>
                {linksData.length > 0 && (
                  <button
                    onClick={() => {
                      setLinkTypeFilter("all");
                      setStatusFilter("all");
                    }}
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkTable;
