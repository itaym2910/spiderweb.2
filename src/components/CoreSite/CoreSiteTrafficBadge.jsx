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

  const isValidTrafficRate = (val) => {
    if (val === undefined || val === null) return false;
    const str = String(val).trim();
    return (
      str !== "" &&
      str !== "N/A" &&
      str !== "--" &&
      str !== "null" &&
      str !== "undefined" &&
      !str.includes("undefined") &&
      !str.includes("null")
    );
  };

  if (
    !trafficData ||
    !trafficData.traffic ||
    trafficData.error ||
    !isValidTrafficRate(trafficData.traffic.in) ||
    !isValidTrafficRate(trafficData.traffic.out)
  ) {
    return null;
  }

  const { in: trafficIn, out: trafficOut } = trafficData.traffic;

  const isDark = theme === "dark";

  // Size styling
  const sizeClasses = {
    sm: "px-2.5 py-1 text-[11px] gap-2 rounded-full",
    md: "px-3.5 py-1.5 text-xs gap-3 rounded-full",
    lg: "px-4 py-2 text-sm gap-3.5 rounded-full",
  }[size] || "px-3.5 py-1.5 text-xs gap-3 rounded-full";

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size] || "w-3.5 h-3.5";

  return (
    <div
      className={`inline-flex items-center font-sans font-semibold tracking-tight shadow-md transition-all duration-200 border ${
        isDark
          ? "bg-gray-800/90 border-gray-700/80 text-gray-100 backdrop-blur-md shadow-black/20"
          : "bg-white/95 border-gray-200 text-gray-800 backdrop-blur-md shadow-gray-200/50"
      } ${sizeClasses} ${className}`}
      title={`Live Site Traffic - Inbound: ${trafficIn} | Outbound: ${trafficOut}`}
    >
      {showActivity && (
        <span className="flex items-center text-emerald-400 mr-0.5">
          <Activity className={`${iconSizes} animate-pulse`} />
        </span>
      )}

      {/* Inbound Traffic */}
      <span
        className={`flex items-center gap-1.5 ${
          isDark ? "text-emerald-400" : "text-emerald-600"
        }`}
      >
        <ArrowDownToLine className={`${iconSizes} flex-shrink-0 stroke-[2.2]`} />
        <span>{trafficIn}</span>
      </span>

      {/* Subtle Dot or Divider */}
      <span
        className={`h-3 w-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
      />

      {/* Outbound Traffic */}
      <span
        className={`flex items-center gap-1.5 ${
          isDark ? "text-amber-400" : "text-amber-600"
        }`}
      >
        <ArrowUpFromLine className={`${iconSizes} flex-shrink-0 stroke-[2.2]`} />
        <span>{trafficOut}</span>
      </span>
    </div>
  );
}
