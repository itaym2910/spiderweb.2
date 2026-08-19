import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowUp,
  ArrowDown,
  Clock,
  Search,
  X,
  Activity,
  CheckCircle2,
  ExternalLink,
  Layers,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

/**
 * Formats elapsed time since a given date into a human readable duration string.
 * e.g., "3d 4h", "2h 15m", "45m", "< 1m"
 */
export function formatDuration(timestamp) {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "N/A";

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remHours = diffHours % 24;
    return remHours > 0 ? `${diffDays}d ${remHours}h` : `${diffDays}d`;
  }
  if (diffHours > 0) {
    const remMin = diffMin % 60;
    return remMin > 0 ? `${diffHours}h ${remMin}m` : `${diffHours}h`;
  }
  if (diffMin > 0) {
    return `${diffMin}m`;
  }
  return "< 1m";
}

/**
 * Formats a timestamp into a clean localized time string for tooltips.
 */
export function formatExactTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

import { normalizeLinkStatus } from "./drawHelpers";

/**
 * NetworkLinksSideDrawer
 *
 * Renders:
 * 1. Two side buttons (Up / Down) with live count badges on the network chart.
 * 2. A slide-out side panel showing all Up or Down links, search filtering,
 *    and how long each link has been up or down.
 * 3. Mark / Highlight link controls to display relevant links prominently on the chart.
 */
export default function NetworkLinksSideDrawer({
  links = [],
  onLinkClick,
  theme = "light",
  chartName = "Network",
  isOpen: controlledIsOpen,
  onOpenChange,
  markedLinkIds = new Set(),
  onToggleMarkLink,
  onMarkAll,
  onClearMarks,
  onHoverLink,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (val) => {
    const nextVal = typeof val === "function" ? val(isOpen) : val;
    setInternalIsOpen(nextVal);
    onOpenChange?.(nextVal);
  };

  const [activeFilter, setActiveFilter] = useState("up"); // 'up' | 'down' | 'all'
  const [timeFilter, setTimeFilter] = useState("all"); // 'all' | '24h' | '7d' | '30d'
  const [searchQuery, setSearchQuery] = useState("");
  // Local state to trigger re-computation of durations every 10 seconds
  const [, setTimerTick] = useState(0);

  const isDark = theme === "dark";

  // Re-calculate durations periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Classify and enrich links
  const enrichedLinks = useMemo(() => {
    return links.map((link) => {
      const normalizedStatus = normalizeLinkStatus(link);
      const statusDate =
        link.statusChangedAt ||
        link.status_changed_at ||
        link.updated_at ||
        link.timestamp ||
        link.created_at ||
        new Date().toISOString();
      const durationStr = formatDuration(statusDate);
      const exactTimeStr = formatExactTime(statusDate);

      const sourceName =
        typeof link.source === "object"
          ? link.source.id || link.source.name
          : link.source;
      const targetName =
        typeof link.target === "object"
          ? link.target.id || link.target.name
          : link.target;

      return {
        ...link,
        sourceName,
        targetName,
        normalizedStatus,
        statusDate,
        durationStr,
        exactTimeStr,
      };
    });
  }, [links]);

  // Counts
  const upCount = useMemo(
    () => enrichedLinks.filter((l) => l.normalizedStatus === "up").length,
    [enrichedLinks]
  );
  const downCount = useMemo(
    () => enrichedLinks.filter((l) => l.normalizedStatus !== "up").length,
    [enrichedLinks]
  );

  // Time filter counts based on the active status tab
  const timeCounts = useMemo(() => {
    const statusFiltered = enrichedLinks.filter((link) => {
      if (activeFilter === "up") return link.normalizedStatus === "up";
      if (activeFilter === "down") return link.normalizedStatus !== "up";
      return true;
    });

    const counts = { all: statusFiltered.length, "24h": 0, "7d": 0, "30d": 0 };
    const now = Date.now();

    statusFiltered.forEach((link) => {
      const d = new Date(link.statusDate);
      if (!isNaN(d.getTime())) {
        const diffHours = (now - d.getTime()) / (1000 * 60 * 60);
        if (diffHours <= 24) counts["24h"]++;
        if (diffHours <= 24 * 7) counts["7d"]++;
        if (diffHours <= 24 * 30) counts["30d"]++;
      }
    });

    return counts;
  }, [enrichedLinks, activeFilter]);

  // Filtered links for the active view, time window, and search
  const filteredLinks = useMemo(() => {
    return enrichedLinks.filter((link) => {
      // Status filter
      if (activeFilter === "up" && link.normalizedStatus !== "up") return false;
      if (activeFilter === "down" && link.normalizedStatus === "up") return false;

      // Time filter
      if (timeFilter !== "all") {
        const targetDate = new Date(link.statusDate);
        if (!isNaN(targetDate.getTime())) {
          const diffHours = (Date.now() - targetDate.getTime()) / (1000 * 60 * 60);
          if (timeFilter === "24h" && diffHours > 24) return false;
          if (timeFilter === "7d" && diffHours > 24 * 7) return false;
          if (timeFilter === "30d" && diffHours > 24 * 30) return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const src = String(link.sourceName || "").toLowerCase();
        const tgt = String(link.targetName || "").toLowerCase();
        const id = String(link.id || "").toLowerCase();
        const srcZone = String(link.sourceZone || "").toLowerCase();
        const tgtZone = String(link.targetZone || "").toLowerCase();
        const desc = String(link.description || link.Description || "").toLowerCase();
        const ip = String(link.ip || "").toLowerCase();

        return (
          src.includes(q) ||
          tgt.includes(q) ||
          id.includes(q) ||
          srcZone.includes(q) ||
          tgtZone.includes(q) ||
          desc.includes(q) ||
          ip.includes(q)
        );
      }

      return true;
    });
  }, [enrichedLinks, activeFilter, timeFilter, searchQuery]);

  // Helper to get links matching status and time window for marking on chart
  const getMatchingLinks = (statusF, timeF) => {
    return enrichedLinks.filter((link) => {
      // Status filter
      if (statusF === "up" && link.normalizedStatus !== "up") return false;
      if (statusF === "down" && link.normalizedStatus === "up") return false;

      // Time filter
      if (timeF && timeF !== "all") {
        const targetDate = new Date(link.statusDate);
        if (!isNaN(targetDate.getTime())) {
          const diffHours =
            (Date.now() - targetDate.getTime()) / (1000 * 60 * 60);
          if (timeF === "24h" && diffHours > 24) return false;
          if (timeF === "7d" && diffHours > 24 * 7) return false;
          if (timeF === "30d" && diffHours > 24 * 30) return false;
        }
      }
      return true;
    });
  };

  // Handle clicking the Up or Down floating button
  const handleButtonClick = (filterType) => {
    if (isOpen && activeFilter === filterType) {
      setIsOpen(false);
      onClearMarks?.();
    } else {
      setActiveFilter(filterType);
      setIsOpen(true);
      const matching = getMatchingLinks(filterType, timeFilter);
      onMarkAll?.(matching.map((l) => l.id));
    }
  };

  // Handle status tab clicks (Up, Down, All)
  const handleStatusTabClick = (filterType) => {
    setActiveFilter(filterType);
    const matching = getMatchingLinks(filterType, timeFilter);
    onMarkAll?.(matching.map((l) => l.id));
  };

  // Handle time window filter clicks (<24h, <7d, <1 Month, All)
  const handleTimeFilterClick = (newTimeFilter) => {
    setTimeFilter(newTimeFilter);
    const matching = getMatchingLinks(activeFilter, newTimeFilter);
    onMarkAll?.(matching.map((l) => l.id));
  };

  const markedCount = markedLinkIds ? markedLinkIds.size : 0;

  return (
    <>
      {/* ========================================================= */}
      {/* FLOATING SIDE ACTION BUTTONS (UP & DOWN)                 */}
      {/* ========================================================= */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5">
        {/* UP Links Button */}
        <button
          type="button"
          onClick={() => handleButtonClick("up")}
          title={`View all Up links (${upCount})`}
          className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 border ${
            isOpen && activeFilter === "up"
              ? "bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/50 shadow-emerald-500/20"
              : isDark
              ? "bg-gray-800/90 hover:bg-gray-700/90 text-emerald-400 border-gray-700/80 hover:border-emerald-500/50 backdrop-blur-md shadow-black/20"
              : "bg-white/95 hover:bg-emerald-50/90 text-emerald-700 border-gray-200 hover:border-emerald-300 backdrop-blur-md shadow-gray-200/50"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
              isOpen && activeFilter === "up"
                ? "bg-white/20 text-white"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white"
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>Up</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
              isOpen && activeFilter === "up"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {upCount}
          </span>
        </button>

        {/* DOWN Links Button */}
        <button
          type="button"
          onClick={() => handleButtonClick("down")}
          title={`View all Down links (${downCount})`}
          className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 border ${
            isOpen && activeFilter === "down"
              ? "bg-rose-600 text-white border-rose-500 ring-2 ring-rose-400/50 shadow-rose-500/20"
              : isDark
              ? "bg-gray-800/90 hover:bg-gray-700/90 text-rose-400 border-gray-700/80 hover:border-rose-500/50 backdrop-blur-md shadow-black/20"
              : "bg-white/95 hover:bg-rose-50/90 text-rose-700 border-gray-200 hover:border-rose-300 backdrop-blur-md shadow-gray-200/50"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
              isOpen && activeFilter === "down"
                ? "bg-white/20 text-white"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white"
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>Down</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
              isOpen && activeFilter === "down"
                ? "bg-rose-700 text-white"
                : downCount > 0
                ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            }`}
          >
            {downCount}
          </span>
        </button>

        {/* Marked Indicator Badge (if any links marked on chart) */}
        {markedCount > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="Marked links active on chart"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/40 shadow-md backdrop-blur-md animate-pulse"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{markedCount} on chart</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* SLIDE-OUT SIDE DRAWER / PANEL                             */}
      {/* ========================================================= */}
      {/* Backdrop overlay for smaller screens or click away */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-25 transition-opacity"
        />
      )}

      <aside
        aria-label="Network Links Side Drawer"
        className={`absolute top-0 right-0 h-full w-full sm:w-[460px] max-w-full z-30 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out border-l ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        } ${
          isDark
            ? "bg-gray-900/95 border-gray-800 text-gray-100 backdrop-blur-xl"
            : "bg-white/95 border-gray-200 text-gray-900 backdrop-blur-xl"
        }`}
      >
        {/* --- Drawer Header --- */}
        <div
          className={`p-4 border-b flex-shrink-0 flex items-center justify-between ${
            isDark ? "border-gray-800 bg-gray-900/60" : "border-gray-100 bg-gray-50/60"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                activeFilter === "up"
                  ? "bg-emerald-500/15 text-emerald-500"
                  : activeFilter === "down"
                  ? "bg-rose-500/15 text-rose-500"
                  : "bg-blue-500/15 text-blue-500"
              }`}
            >
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {activeFilter === "up"
                  ? "Up Links"
                  : activeFilter === "down"
                  ? "Down / Issue Links"
                  : "All Network Links"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {chartName} Chart • {filteredLinks.length} visible link
                {filteredLinks.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            title="Close panel"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- Filter Tabs, Time Range & Search Controls --- */}
        <div
          className={`p-3 border-b flex-shrink-0 space-y-2.5 ${
            isDark ? "border-gray-800" : "border-gray-100"
          }`}
        >
          {/* Status Tabs switch */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => handleStatusTabClick("up")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "up"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Up ({upCount})</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusTabClick("down")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "down"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Down ({downCount})</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusTabClick("all")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All ({enrichedLinks.length})</span>
            </button>
          </div>

          {/* Time Filter Bar */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-gray-400" />
              Time:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none flex-1">
              {[
                { id: "all", label: "All" },
                { id: "24h", label: "< 24h" },
                { id: "7d", label: "< 7d" },
                { id: "30d", label: "< 1 Month" },
              ].map((opt) => {
                const isSelected = timeFilter === opt.id;
                const count = timeCounts[opt.id] ?? 0;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleTimeFilterClick(opt.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm font-semibold"
                        : isDark
                        ? "bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`text-[10px] px-1 rounded-full ${
                        isSelected
                          ? "bg-blue-700 text-white"
                          : isDark
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search bar & Mark All button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by device, zone, IP..."
                className={`w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border outline-none transition-all ${
                  isDark
                    ? "bg-gray-800/80 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Clear chart highlights button (if any marks are active) */}
            {markedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (onClearMarks) onClearMarks();
                }}
                title="Clear chart highlights"
                className="px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-gray-200 dark:border-gray-700 transition-colors shrink-0"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Clear ({markedCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* --- Links List (Scrollable) --- */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
          {filteredLinks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  activeFilter === "down"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                }`}
              >
                {activeFilter === "down" ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Search className="w-6 h-6" />
                )}
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {activeFilter === "down"
                  ? "No Down Links Detected"
                  : searchQuery
                  ? "No Matching Links Found"
                  : timeFilter !== "all"
                  ? "No Links in Selected Timeframe"
                  : "No Links Available"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[240px]">
                {activeFilter === "down"
                  ? "All chart links are currently healthy and operational."
                  : searchQuery
                  ? `No links matched your query "${searchQuery}".`
                  : timeFilter !== "all"
                  ? "No links matched the selected time range. Try selecting 'All Time'."
                  : "No links found for the selected category."}
              </p>
              {timeFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setTimeFilter("all")}
                  className="mt-3 px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm"
                >
                  Reset Time Filter
                </button>
              )}
            </div>
          ) : (
            filteredLinks.map((link) => {
              const isLinkUp = link.normalizedStatus === "up";
              const isLinkIssue = link.normalizedStatus === "issue";
              const isLinkMarked = markedLinkIds && markedLinkIds.has(link.id);

              return (
                <div
                  key={link.id || `${link.sourceName}-${link.targetName}`}
                  onMouseEnter={() => onHoverLink?.(link.id)}
                  onMouseLeave={() => onHoverLink?.(null)}
                  onClick={() => {
                    if (onLinkClick) {
                      onLinkClick({
                        ...link,
                        sourceNode: link.sourceName,
                        targetNode: link.targetName,
                      });
                    }
                  }}
                  className={`group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isLinkMarked
                      ? isDark
                        ? "bg-amber-950/20 border-amber-500/70 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/50"
                        : "bg-amber-50/70 border-amber-300 shadow-md shadow-amber-200/50 ring-1 ring-amber-400/50"
                      : isDark
                      ? "bg-gray-800/60 hover:bg-gray-800 border-gray-700/60 hover:border-gray-600"
                      : "bg-white hover:bg-gray-50/80 border-gray-200/80 hover:border-gray-300 shadow-sm"
                  }`}
                >
                  {/* Card Top: Status & Duration & Mark Button */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Status badge */}
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isLinkUp
                              ? "bg-emerald-400"
                              : isLinkIssue
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                        />
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${
                            isLinkUp
                              ? "bg-emerald-500"
                              : isLinkIssue
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                      </span>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isLinkUp
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isLinkIssue
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isLinkUp ? "UP" : isLinkIssue ? "ISSUE" : "DOWN"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Duration */}
                      <div
                        title={
                          link.exactTimeStr
                            ? `Status change: ${link.exactTimeStr}`
                            : undefined
                        }
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isLinkUp
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                            : isLinkIssue
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                        }`}
                      >
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>
                          {isLinkUp ? "Up" : isLinkIssue ? "Issue" : "Down"} for{" "}
                          <strong className="font-semibold">{link.durationStr}</strong>
                        </span>
                      </div>

                      {/* Mark on chart button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleMarkLink) onToggleMarkLink(link.id);
                        }}
                        title={isLinkMarked ? "Unmark from chart" : "Mark link on chart"}
                        className={`p-1 rounded-md transition-colors ${
                          isLinkMarked
                            ? "bg-amber-500 text-white shadow-sm"
                            : "text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Middle: Source ⟷ Target */}
                  <div className="flex items-center justify-between text-xs font-semibold py-1">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="truncate text-gray-800 dark:text-gray-100 font-mono">
                        {link.sourceName}
                      </span>
                      {link.sourceZone && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          {link.sourceZone}
                        </span>
                      )}
                    </div>

                    <div className="text-gray-400 dark:text-gray-500 px-1 font-mono text-[10px]">
                      ⟷
                    </div>

                    <div className="flex flex-col min-w-0 pl-2 text-right">
                      <span className="truncate text-gray-800 dark:text-gray-100 font-mono">
                        {link.targetName}
                      </span>
                      {link.targetZone && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          {link.targetZone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Meta info & Inspect button */}
                  <div
                    className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 ${
                      isDark ? "border-gray-700/50" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{link.Bandwidth || link.bandwidth || "10 Gbps"}</span>
                      <span>•</span>
                      <span>{link.MediaType || link.media_type || "Fiber"}</span>
                      {link.ip && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{link.ip}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 font-medium group-hover:underline">
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}

