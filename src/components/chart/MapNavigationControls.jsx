import React, { useState } from "react";
import {
  Plus,
  Minus,
  Maximize2,
  Map,
  RotateCcw,
  Info,
} from "lucide-react";

export default function MapNavigationControls({
  theme = "dark",
  zoomPercent = 100,
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetZoom,
  isMinimapOpen = true,
  onToggleMinimap,
}) {
  const isDark = theme === "dark";
  const [showHelp, setShowHelp] = useState(false);

  const buttonBaseClass = `w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150 active:scale-95 text-sm font-semibold ${
    isDark
      ? "text-gray-300 hover:text-white hover:bg-gray-700/80 active:bg-gray-600/80"
      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200"
  }`;

  return (
    <div className="flex flex-col items-end gap-2 pointer-events-auto select-none">
      {/* Keyboard shortcuts popup */}
      {showHelp && (
        <div
          className={`p-3 rounded-xl shadow-2xl border text-xs max-w-xs transition-all animate-in fade-in slide-in-from-bottom-2 ${
            isDark
              ? "bg-gray-900/95 border-gray-700/80 text-gray-300 shadow-black/40"
              : "bg-white/95 border-gray-200 text-gray-700 shadow-gray-300/60"
          } backdrop-blur-md`}
        >
          <div className="font-bold mb-2 flex items-center justify-between text-sky-400">
            <span>Navigation Shortcuts</span>
            <button
              onClick={() => setShowHelp(false)}
              className="hover:opacity-75 font-mono px-1 text-gray-400"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div><kbd className="px-1.5 py-0.5 rounded bg-gray-700/40 border border-gray-600/40 text-[10px] font-mono">Scroll</kbd> Zoom in/out</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-gray-700/40 border border-gray-600/40 text-[10px] font-mono">Drag</kbd> Pan canvas</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-gray-700/40 border border-gray-600/40 text-[10px] font-mono">+ / -</kbd> Zoom in / out</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-gray-700/40 border border-gray-600/40 text-[10px] font-mono">Space / F</kbd> Fit to view</div>
            <div className="col-span-2 pt-1 border-t border-gray-700/40 text-[11px] text-gray-400">
              💡 <em>Double-click canvas:</em> zooms in when overviewing, or resets to fit when zoomed in.
            </div>
          </div>
        </div>
      )}

      {/* Main floating control pill */}
      <div
        className={`flex items-center gap-1 p-1 rounded-xl shadow-xl border backdrop-blur-md transition-colors ${
          isDark
            ? "bg-gray-900/90 border-gray-700/80 text-gray-200 shadow-black/30"
            : "bg-white/95 border-gray-200 text-gray-800 shadow-gray-300/40"
        }`}
      >
        {/* Zoom In */}
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In (+)"
          aria-label="Zoom In"
          className={buttonBaseClass}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Zoom Level Indicator */}
        <button
          type="button"
          onClick={onResetZoom}
          title={`Current Zoom: ${zoomPercent}%. Click to reset to 100%`}
          aria-label="Reset Zoom"
          className={`px-2 h-9 flex items-center justify-center rounded-lg font-mono text-xs font-semibold transition-colors ${
            isDark
              ? "hover:bg-gray-800 text-sky-400"
              : "hover:bg-gray-100 text-sky-600"
          }`}
        >
          {zoomPercent}%
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out (-)"
          aria-label="Zoom Out"
          className={buttonBaseClass}
        >
          <Minus className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div
          className={`w-[1px] h-5 mx-0.5 ${
            isDark ? "bg-gray-700" : "bg-gray-200"
          }`}
        />

        {/* Fit to View */}
        <button
          type="button"
          onClick={onFitView}
          title="Fit to Screen (F or Space)"
          aria-label="Fit to Screen"
          className={buttonBaseClass}
        >
          <Maximize2 className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Toggle Minimap */}
        <button
          type="button"
          onClick={onToggleMinimap}
          title={isMinimapOpen ? "Hide Minimap" : "Show Minimap"}
          aria-label="Toggle Minimap"
          className={`${buttonBaseClass} ${
            isMinimapOpen
              ? isDark
                ? "bg-sky-500/20 text-sky-400"
                : "bg-sky-100 text-sky-700"
              : ""
          }`}
        >
          <Map className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Shortcuts Info */}
        <button
          type="button"
          onClick={() => setShowHelp((prev) => !prev)}
          title="Navigation Tips & Shortcuts"
          aria-label="Navigation Tips"
          className={buttonBaseClass}
        >
          <Info className="w-4 h-4 stroke-[2]" />
        </button>
      </div>
    </div>
  );
}
