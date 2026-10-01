import React from "react";
import { Compass, ChevronDown } from "lucide-react";

export default function ZoneNavigatorBar({
  theme = "dark",
  zones = [],
  activeZoneId = null,
  onSelectZone,
  onFitAll,
}) {
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-1.5 pointer-events-auto select-none">
      <div
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl shadow-lg border backdrop-blur-md transition-colors ${
          isDark
            ? "bg-gray-900/90 border-gray-700/80 text-gray-300 shadow-black/20"
            : "bg-white/95 border-gray-200 text-gray-700 shadow-gray-200/50"
        }`}
      >
        <Compass className="w-3.5 h-3.5 text-sky-500 shrink-0" />
        <span className="text-xs font-semibold hidden sm:inline text-gray-400">
          Site:
        </span>

        {/* All Sites Button */}
        <button
          type="button"
          onClick={onFitAll}
          className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
            !activeZoneId
              ? isDark
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                : "bg-sky-100 text-sky-800 border border-sky-300"
              : isDark
              ? "hover:bg-gray-800 text-gray-400 hover:text-white"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          }`}
        >
          All Sites
        </button>

        {/* Dropdown / Quick buttons for zones */}
        <div className="relative group">
          <select
            value={activeZoneId || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                onFitAll?.();
              } else {
                const found = zones.find((z) => z.id === val);
                if (found) onSelectZone?.(found);
              }
            }}
            className={`text-xs font-semibold rounded-lg px-2 py-1 outline-none transition-colors cursor-pointer appearance-none pr-6 ${
              activeZoneId
                ? isDark
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                  : "bg-sky-100 text-sky-800 border border-sky-300"
                : isDark
                ? "bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700/60"
                : "bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 border border-gray-300/60"
            }`}
          >
            <option value="" className={isDark ? "bg-gray-900 text-gray-300" : "bg-white text-gray-800"}>
              Jump to Site...
            </option>
            {zones.map((zone) => (
              <option
                key={zone.id}
                value={zone.id}
                className={isDark ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"}
              >
                {zone.id}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
