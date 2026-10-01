import React, { useState } from "react";
import {
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingDown,
  Layers,
  Radio,
} from "lucide-react";

/**
 * PingSummaryModal
 * A clean, neat, and comprehensive summary dialog displaying aggregate ping telemetry across all lines.
 */
export default function PingSummaryModal({
  isOpen,
  onClose,
  pingSummary,
  chartName = "Network",
  onSelectLink,
  onOpenDrawerToPing,
  theme,
}) {
  const [filterType, setFilterType] = useState("problem"); // 'problem' | 'all' | 'healthy' | 'degraded' | 'down'

  if (!isOpen || !pingSummary) return null;

  const isDark = theme === "dark";

  const {
    totalLinks,
    monitoredCount,
    totalPacketsSuccess,
    totalPacketsTotal,
    totalPacketsLost,
    overallSuccessRate,
    overallLossRate,
    formattedRate,
    formattedPackets,
    healthyCount,
    degradedCount,
    downCount,
    healthyPercent,
    degradedPercent,
    downPercent,
    statusCategory,
    problemLinks,
    healthyLinks,
  } = pingSummary;

  // Determine which links to show in the detail list
  const displayedLinks = (() => {
    if (filterType === "healthy") return healthyLinks;
    if (filterType === "degraded")
      return problemLinks.filter((l) => (l.numRate ?? 0) > 0);
    if (filterType === "down")
      return problemLinks.filter((l) => (l.numRate ?? 0) === 0);
    if (filterType === "all") return [...problemLinks, ...healthyLinks];
    // Default: 'problem' links (degraded + down)
    return problemLinks;
  })();

  const rateColorClass =
    statusCategory === "optimal"
      ? "text-emerald-500 dark:text-emerald-400"
      : statusCategory === "degraded"
      ? "text-amber-500 dark:text-amber-400"
      : "text-rose-500 dark:text-rose-400";

  const badgeBgClass =
    statusCategory === "optimal"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : statusCategory === "degraded"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border transition-all duration-200 overflow-hidden flex flex-col max-h-[90vh] select-text ${
          isDark
            ? "bg-gray-900 border-gray-800 text-gray-100"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isDark ? "border-gray-800 bg-gray-900/80" : "border-gray-100 bg-gray-50/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Ping Telemetry Summary</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  {chartName}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Aggregate real-time ICMP ping health across all monitored lines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Card 1: Overall Ping Rate */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                isDark ? "bg-gray-800/60 border-gray-700/60" : "bg-gray-50 border-gray-200/80"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Overall Success Rate</span>
                <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold tracking-tight ${rateColorClass}`}>
                  {formattedRate}
                </span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${badgeBgClass}`}
                >
                  {statusCategory === "optimal"
                    ? "Healthy (0 Loss)"
                    : statusCategory === "degraded"
                    ? "Packet Loss Detected"
                    : "Critical (High Loss)"}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                {problemLinks.length > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    ⚠️ {problemLinks.length} line{problemLinks.length > 1 ? "s" : ""} with packet loss ({healthyCount}/{monitoredCount} healthy)
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    All {monitoredCount} lines at 100% (0 loss)
                  </span>
                )}
              </p>
            </div>

            {/* Card 2: Packet Ratio */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                isDark ? "bg-gray-800/60 border-gray-700/60" : "bg-gray-50 border-gray-200/80"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Packets Received / Sent</span>
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono">
                  {totalPacketsSuccess}
                </span>
                <span className="text-sm font-semibold text-gray-400 font-mono">
                  / {totalPacketsTotal}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                {totalPacketsLost > 0 ? (
                  <>
                    <TrendingDown className="w-3 h-3 text-rose-500 shrink-0" />
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      {totalPacketsLost} pkt{totalPacketsLost > 1 ? "s" : ""} lost ({pingSummary.formattedLossRate || (overallLossRate < 0.1 ? "<0.1%" : `${overallLossRate}%`)})
                    </span>
                  </>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    0 packet loss detected
                  </span>
                )}
              </p>
            </div>

            {/* Card 3: Lines Monitored */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                isDark ? "bg-gray-800/60 border-gray-700/60" : "bg-gray-50 border-gray-200/80"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Total Monitored Lines</span>
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{monitoredCount}</span>
                <span className="text-xs font-medium text-gray-400">Lines</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                {problemLinks.length > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{problemLinks.length} line(s) have packet drop</span>
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    All lines operational (100%)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Distribution Bar */}
          <div
            className={`p-4 rounded-xl border ${
              isDark ? "bg-gray-800/40 border-gray-800" : "bg-gray-50/70 border-gray-200/60"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <span>Lines Health Breakdown</span>
              <span className="text-gray-400 font-normal">
                {monitoredCount} lines evaluated
              </span>
            </div>

            {/* Segmented Bar */}
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
              {healthyPercent > 0 && (
                <div
                  style={{ width: `${healthyPercent}%` }}
                  className="bg-emerald-500 h-full transition-all duration-300"
                  title={`Healthy (100%): ${healthyCount} lines (${healthyPercent}%)`}
                />
              )}
              {degradedPercent > 0 && (
                <div
                  style={{ width: `${degradedPercent}%` }}
                  className="bg-amber-500 h-full transition-all duration-300"
                  title={`Degraded (<100%): ${degradedCount} lines (${degradedPercent}%)`}
                />
              )}
              {downPercent > 0 && (
                <div
                  style={{ width: `${downPercent}%` }}
                  className="bg-rose-500 h-full transition-all duration-300"
                  title={`Down (0%): ${downCount} lines (${downPercent}%)`}
                />
              )}
            </div>

            {/* Interactive Filter Chips */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <button
                type="button"
                onClick={() => setFilterType(filterType === "healthy" ? "problem" : "healthy")}
                className={`p-2 rounded-lg border text-left transition-all ${
                  filterType === "healthy"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/50"
                    : isDark
                    ? "bg-gray-800/50 hover:bg-gray-800 border-gray-700 text-gray-300"
                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Healthy (100%)</span>
                </div>
                <div className="font-bold text-base mt-1">
                  {healthyCount}{" "}
                  <span className="text-[11px] font-normal text-gray-400">
                    ({healthyPercent}%)
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFilterType(filterType === "degraded" ? "problem" : "degraded")}
                className={`p-2 rounded-lg border text-left transition-all ${
                  filterType === "degraded"
                    ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/50"
                    : isDark
                    ? "bg-gray-800/50 hover:bg-gray-800 border-gray-700 text-gray-300"
                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Degraded (&lt;100%)</span>
                </div>
                <div className="font-bold text-base mt-1">
                  {degradedCount}{" "}
                  <span className="text-[11px] font-normal text-gray-400">
                    ({degradedPercent}%)
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFilterType(filterType === "down" ? "problem" : "down")}
                className={`p-2 rounded-lg border text-left transition-all ${
                  filterType === "down"
                    ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/50"
                    : isDark
                    ? "bg-gray-800/50 hover:bg-gray-800 border-gray-700 text-gray-300"
                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Offline (0%)</span>
                </div>
                <div className="font-bold text-base mt-1">
                  {downCount}{" "}
                  <span className="text-[11px] font-normal text-gray-400">
                    ({downPercent}%)
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Lines Table / List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                {filterType === "healthy" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Healthy Lines ({displayedLinks.length})</span>
                  </>
                ) : filterType === "degraded" ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Degraded Lines with Packet Loss ({displayedLinks.length})</span>
                  </>
                ) : filterType === "down" ? (
                  <>
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Offline Lines ({displayedLinks.length})</span>
                  </>
                ) : filterType === "all" ? (
                  <>
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>All Network Lines ({displayedLinks.length})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Lines Requiring Attention ({displayedLinks.length})</span>
                  </>
                )}
              </h3>

              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterType("problem")}
                  className={`px-2 py-0.5 rounded font-medium ${
                    filterType === "problem"
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  Issues
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`px-2 py-0.5 rounded font-medium ${
                    filterType === "all"
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  All ({totalLinks})
                </button>
              </div>
            </div>

            {displayedLinks.length === 0 ? (
              <div
                className={`p-6 rounded-xl border text-center ${
                  isDark
                    ? "bg-gray-800/30 border-gray-800 text-gray-400"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  {filterType === "problem"
                    ? "All network lines are operating with 100% ping success rate!"
                    : "No links found in this category."}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Zero packet loss detected on active routes.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {displayedLinks.map((link) => {
                  const pInfo = link.pingInfo;
                  const numRate =
                    pInfo?.rate ??
                    link.numRate ??
                    Number(String(link.ping_success_rate ?? 0).replace("%", ""));
                  const packetsLost =
                    pInfo?.packetsLost ??
                    link.packetsLost ??
                    (numRate < 100 ? 1 : 0);
                  const hasLoss = packetsLost > 0 || numRate < 100;
                  const isDown = numRate === 0;
                  const srcName = link.sourceName || link.source || "Node A";
                  const tgtName = link.targetName || link.target || "Node B";

                  return (
                    <div
                      key={link.id}
                      onClick={() => {
                        if (window.getSelection && window.getSelection().toString().trim().length > 0) return;
                        onSelectLink && onSelectLink(link);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                        isDark
                          ? "bg-gray-800/40 hover:bg-gray-800 border-gray-700/60 hover:border-blue-500/50"
                          : "bg-white hover:bg-blue-50/50 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isDown
                              ? "bg-rose-500"
                              : hasLoss
                              ? "bg-amber-500 animate-pulse"
                              : "bg-emerald-500"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-medium text-xs truncate">
                            <span className="font-mono text-gray-900 dark:text-gray-100">
                              {srcName}
                            </span>
                            <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="font-mono text-gray-900 dark:text-gray-100">
                              {tgtName}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{link.local_interface || "GigabitEthernet"}</span>
                            <span>•</span>
                            <span>{link.sourceZone || link.coresite_name || "Core"}</span>
                            {hasLoss && (
                              <>
                                <span>•</span>
                                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                  <span>{packetsLost} packet{packetsLost > 1 ? "s" : ""} dropped</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-bold border flex items-center gap-1 ${
                            isDown
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              : hasLoss
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {hasLoss && !isDown && <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />}
                          <span>{pInfo ? pInfo.short : `${numRate}%`}</span>
                          {hasLoss && !isDown && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                              ({packetsLost} lost)
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-blue-500 group-hover:underline">
                          Details →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-6 py-3.5 border-t shrink-0 ${
            isDark ? "border-gray-800 bg-gray-900/60" : "border-gray-100 bg-gray-50/60"
          }`}
        >
          {onOpenDrawerToPing ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDrawerToPing();
              }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
            >
              <span>Explore all lines in side drawer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
