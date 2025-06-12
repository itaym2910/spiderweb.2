// src/components/CoreSite/CoreSiteControls.jsx
import React from "react";

export default function CoreSiteControls({
  theme,
  displayZoneId,
  selectedNodeId,
  onToggleSwitch,
  mainToggleOption1Text,
  mainToggleOption2Text,
  zoneId,
  showExtendedNodes,
  onToggleExtendedNodes,
}) {
  // Conditional Button styles (reference for indigo)
  const conditionalButtonBg =
    theme === "dark"
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-indigo-500 hover:bg-indigo-600";
  const conditionalButtonText = "text-white";

  // --- Updated Toggle Switch Styles ---
  const toggleTrackBg = theme === "dark" ? "bg-slate-700" : "bg-slate-200";
  const toggleThumbBg = theme === "dark" ? "bg-indigo-600" : "bg-indigo-500"; // Using indigo
  const toggleThumbText = "text-white"; // White text on indigo thumb remains good
  const toggleTrackText =
    theme === "dark" ? "text-slate-300" : "text-slate-600"; // Adjusted for slate track
  const toggleFocusRing =
    theme === "dark"
      ? "focus:ring-indigo-400" // Indigo focus ring
      : "focus:ring-indigo-600";

  const zoneTitleColor = theme === "dark" ? "text-white" : "text-sky-800";

  const isMainToggleOption1Selected = showExtendedNodes
    ? selectedNodeId === "Node 5"
    : selectedNodeId === "Node 4";

  const isConditionalButtonVisible = zoneId === "Zone 5" || zoneId === "Zone 6";
  const conditionalButtonActualText = showExtendedNodes
    ? "Display Node 1 and Node 2"
    : "Display Node 5 and Node 6";

  return (
    <div
      className="absolute flex flex-col items-center z-30"
      style={{
        left: `50%`,
        top: `1rem`,
        transform: "translateX(-50%)",
      }}
    >
      <div className={`mb-2 text-lg font-bold ${zoneTitleColor}`}>
        {displayZoneId}
      </div>

      {isConditionalButtonVisible && (
        <button
          type="button"
          onClick={onToggleExtendedNodes}
          className={`mb-3 px-4 py-2 rounded-md text-sm font-semibold shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-opacity-75
                      ${conditionalButtonBg} ${conditionalButtonText}
                      ${
                        theme === "dark"
                          ? "focus:ring-indigo-400 focus:ring-offset-gray-800"
                          : "focus:ring-indigo-500 focus:ring-offset-white"
                      }`}
        >
          {conditionalButtonActualText}
        </button>
      )}

      {/* Main Toggle Switch - Updated for color and size */}
      <button
        type="button"
        onClick={onToggleSwitch}
        className={`relative inline-flex items-center rounded-full 
                    h-11 min-w-[380px] p-1.5  /* Increased height, min-width, and padding */
                    transition-colors duration-200 ease-in-out cursor-pointer group
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    ${
                      theme === "dark"
                        ? "focus:ring-offset-slate-800" // Adjusted offset for slate bg
                        : "focus:ring-offset-white"
                    }
                    ${toggleFocusRing} 
                    ${toggleTrackBg}`}
        role="switch"
        aria-checked={isMainToggleOption1Selected}
      >
        <span className="sr-only">Select Focused Node</span>
        {/* Track Texts */}
        <div className="absolute inset-0 flex items-center justify-around w-full px-1.5">
          {" "}
          {/* Padding for text labels inside track */}
          <span className={`text-sm font-medium ${toggleTrackText}`}>
            {" "}
            {/* text-sm */}
            {mainToggleOption1Text}
          </span>
          <span className={`text-sm font-medium ${toggleTrackText}`}>
            {" "}
            {/* text-sm */}
            {mainToggleOption2Text}
          </span>
        </div>
        {/* Thumb */}
        <span
          aria-hidden="true"
          className={`pointer-events-none relative inline-flex items-center justify-center 
                      h-8 w-[calc(50%-6px)] rounded-full /* Increased height, adjusted width for p-1.5 (6px) */
                      ${toggleThumbBg} shadow-lg /* Added shadow-lg for more depth */
                      transform transition-transform duration-200 ease-in-out`}
          style={{
            // If button padding p-1.5 (6px), thumb translates its own width + 6px
            transform: isMainToggleOption1Selected
              ? "translateX(0%)"
              : "translateX(calc(100% + 6px))",
          }}
        >
          <span className={`text-sm font-medium ${toggleThumbText}`}>
            {" "}
            {/* text-sm */}
            {isMainToggleOption1Selected
              ? mainToggleOption1Text
              : mainToggleOption2Text}
          </span>
        </span>
      </button>
    </div>
  );
}
