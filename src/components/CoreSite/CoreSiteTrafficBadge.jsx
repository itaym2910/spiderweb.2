import React from "react";
import { useSelector } from "react-redux";
import { ArrowDownToLine, ArrowUpFromLine, Activity } from "lucide-react";
import { selectAllTrafficById } from "../../redux/slices/coreSiteTrafficSlice";
import { selectAllPikudim } from "../../redux/slices/corePikudimSlice";

/**
 * CoreSiteTrafficBadge
 * Displays inbound and outbound network traffic for a specific core site.
 * Can identify the core site by numeric coreSiteId OR by siteName (zone name).
 */
export default function CoreSiteTrafficBadge({
  coreSiteId,
  siteName,
  theme = "dark",
  size = "md",
  className = "",
  showActivity = false,
}) {
  const allTraffic = useSelector(selectAllTrafficById);
  const allCoreSites = useSelector(selectAllPikudim);

  // Resolve traffic entry by ID or by siteName
  const trafficData = React.useMemo(() => {
    if (coreSiteId && (allTraffic[coreSiteId] || allTraffic[String(coreSiteId)])) {
      return allTraffic[coreSiteId] || allTraffic[String(coreSiteId)];
    }

    if (siteName) {
      // Find matching site in allCoreSites
      const normalized = String(siteName).toLowerCase().trim();
      const matchedSite = allCoreSites.find(
        (s) =>
          (s.name && s.name.toLowerCase().trim() === normalized) ||
          (s.core_site_name && s.core_site_name.toLowerCase().trim() === normalized)
      );
      if (matchedSite && (allTraffic[matchedSite.id] || allTraffic[String(matchedSite.id)])) {
        return allTraffic[matchedSite.id] || allTraffic[String(matchedSite.id)];
      }

      // Check if siteName contains an ID or matches by name in allTraffic values
      const directMatch = Object.values(allTraffic).find(
        (t) => t && (t.name === siteName || t.core_site_name === siteName)
      );
      if (directMatch) return directMatch;
    }

    return null;
  }, [coreSiteId, siteName, allTraffic, allCoreSites]);

  if (!trafficData || !trafficData.traffic) {
    return null;
  }

  const { in: trafficIn, out: trafficOut } = trafficData.traffic;

  const isDark = theme === "dark";

  // Size styling
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-2 rounded-md",
    md: "px-3 py-1 text-xs gap-3 rounded-lg",
    lg: "px-4 py-1.5 text-sm gap-4 rounded-xl",
  }[size] || "px-3 py-1 text-xs gap-3 rounded-lg";

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size] || "w-3.5 h-3.5";

  return (
    <div
      className={`inline-flex items-center font-mono font-medium shadow-sm transition-all duration-200 border ${
        isDark
          ? "bg-slate-900/85 border-slate-700/60 text-slate-200 backdrop-blur-sm"
          : "bg-white/95 border-sky-200 text-sky-950 shadow-sky-100"
      } ${sizeClasses} ${className}`}
      title={`Live Site Traffic - In: ${trafficIn} | Out: ${trafficOut}`}
    >
      {showActivity && (
        <span className="flex items-center gap-1 text-emerald-500 mr-0.5">
          <Activity className={`${iconSizes} animate-pulse`} />
        </span>
      )}

      {/* Inbound Traffic */}
      <span
        className={`flex items-center gap-1 ${
          isDark ? "text-emerald-400" : "text-emerald-600 font-semibold"
        }`}
      >
        <ArrowDownToLine className={`${iconSizes} flex-shrink-0`} />
        <span className="tracking-tight">{trafficIn}</span>
      </span>

      {/* Divider */}
      <span
        className={`h-3 w-px ${isDark ? "bg-slate-700" : "bg-sky-200"}`}
      />

      {/* Outbound Traffic */}
      <span
        className={`flex items-center gap-1 ${
          isDark ? "text-amber-400" : "text-amber-600 font-semibold"
        }`}
      >
        <ArrowUpFromLine className={`${iconSizes} flex-shrink-0`} />
        <span className="tracking-tight">{trafficOut}</span>
      </span>
    </div>
  );
}
