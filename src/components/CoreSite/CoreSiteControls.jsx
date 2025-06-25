import React from "react";

export default function CoreSiteControls({
  theme,
  displayZoneId,
  selectedNodeId,
  onToggleSwitch,
  mainToggleOption1Text,
  mainToggleOption2Text,
  onToggleExtendedNodes,
  showExtendedNodes,
  devicesInZoneCount, // Receives the count of devices in the current zone
}) {
  // --- Style Definitions ---
  const conditionalButtonBg =
    theme === "dark"
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-indigo-500 hover:bg-indigo-600";
  const conditionalButtonText = "text-white";
  const conditionalButtonFocusRing =
    theme === "dark"
      ? "focus:ring-indigo-400 focus:ring-offset-gray-800"
      : "focus:ring-indigo-500 focus:ring-offset-white";

  const toggleTrackBg = theme === "dark" ? "bg-slate-700" : "bg-slate-200";
  const toggleThumbBg = theme === "dark" ? "bg-indigo-600" : "bg-indigo-500";
  const toggleThumbText = "text-white";
  const toggleTrackText =
    theme === "dark" ? "text-slate-300" : "text-slate-600";
  const toggleFocusRing =
    theme === "dark"
      ? "focus:ring-indigo-400 focus:ring-offset-slate-800"
      : "focus:ring-indigo-600 focus:ring-offset-white";

  const zoneTitleColor = theme === "dark" ? "text-white" : "text-sky-800";

  // --- Dynamic Visibility & Text ---
  // The button is visible only if there are more than 4 devices, allowing for a second "page" of nodes.
  const isConditionalButtonVisible = devicesInZoneCount > 4;

  const conditionalButtonActualText = showExtendedNodes
    ? "Show First 4 Devices"
    : "Show More Devices";

  // Determine which option in the main toggle is currently selected
  const isMainToggleOption1Selected = selectedNodeId === mainToggleOption1Text;

  return (
    <div
      className="absolute flex flex-col items-center z-30 pointer-events-none"
      style={{
        left: `50%`,
        top: `1rem`,
        transform: "translateX(-50%)",
        width: "max-content", // Prevent wrapping on smaller screens
      }}
    >
      <div
        className={`mb-2 text-lg font-bold ${zoneTitleColor} pointer-events-auto`}
      >
        {displayZoneId}
      </div>

      {isConditionalButtonVisible && (
        <button
          type="button"
          onClick={onToggleExtendedNodes}
          className={`mb-3 px-4 py-2 rounded-md text-sm font-semibold shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-opacity-75
                      pointer-events-auto
                      ${conditionalButtonBg} ${conditionalButtonText}
                      ${conditionalButtonFocusRing}`}
        >
          {conditionalButtonActualText}
        </button>
      )}

      {/* Main Toggle Switch */}
      <button
        type="button"
        onClick={onToggleSwitch}
        className={`relative inline-flex items-center rounded-full 
                    h-11 min-w-[380px] p-1.5
                    transition-colors duration-200 ease-in-out cursor-pointer group
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    pointer-events-auto
                    ${toggleFocusRing} 
                    ${toggleTrackBg}`}
        role="switch"
        aria-checked={isMainToggleOption1Selected}
        aria-label="Select focused node"
      >
        <span className="sr-only">Select Focused Node</span>

        {/* Track Texts */}
        <div className="absolute inset-0 flex items-center justify-around w-full px-1.5">
          <span className={`text-sm font-medium ${toggleTrackText}`}>
            {mainToggleOption1Text}
          </span>
          <span className={`text-sm font-medium ${toggleTrackText}`}>
            {mainToggleOption2Text}
          </span>
        </div>

        {/* Thumb */}
        <span
          aria-hidden="true"
          className={`pointer-events-none relative inline-flex items-center justify-center 
                      h-8 w-[calc(50%-6px)] rounded-full
                      ${toggleThumbBg} shadow-lg
                      transform transition-transform duration-200 ease-in-out`}
          style={{
            transform: isMainToggleOption1Selected
              ? "translateX(0%)"
              : "translateX(calc(100% + 6px))",
          }}
        >
          <span className={`text-sm font-medium ${toggleThumbText}`}>
            {isMainToggleOption1Selected
              ? mainToggleOption1Text
              : mainToggleOption2Text}
          </span>
        </span>
      </button>
    </div>
  );
}
