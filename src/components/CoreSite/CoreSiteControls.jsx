// src/components/CoreSite/CoreSiteControls.jsx
import React from "react";

export default function CoreSiteControls({
  theme,
  centerX,
  centerY,
  displayZoneId,
  selectedNodeId,
  onToggleSwitch, // This is for the main toggle (N3/N4 or N5/N6)
  mainToggleOption1Text, // e.g., "Node 4 (80 Sites)" or "Node 5 (80 Sites)"
  mainToggleOption2Text, // e.g., "Node 3 (30 Sites)" or "Node 6 (30 Sites)"
  zoneId,
  showExtendedNodes,
  onToggleExtendedNodes, // This is for the "Node 5/6" vs "Node 1/2" button
}) {
  const toggleTrackBg = theme === "dark" ? "bg-gray-700" : "bg-gray-200";
  const toggleThumbBg = theme === "dark" ? "bg-sky-600" : "bg-sky-500";
  const toggleThumbText = theme === "dark" ? "text-white" : "text-white";
  const toggleTrackText = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const zoneTitleColor = theme === "dark" ? "text-white" : "text-sky-800";
  const conditionalButtonBg =
    theme === "dark"
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-indigo-500 hover:bg-indigo-600";
  const conditionalButtonText = "text-white";

  const controlsGroupTop = centerY - 250;

  // Determine which option is selected in the main toggle
  // The first option in the main toggle always corresponds to the "left" side of the visual switch.
  // In N3/N4 mode, "Node 4" is option 1. In N5/N6 mode, "Node 5" is option 1.
  const isMainToggleOption1Selected = showExtendedNodes
    ? selectedNodeId === "Node 5"
    : selectedNodeId === "Node 4";

  const isConditionalButtonVisible = zoneId === "Zone 5" || zoneId === "Zone 6";
  const conditionalButtonActualText = showExtendedNodes
    ? "Node 1 and Node 2"
    : "Node 5 and Node 6";

  if (centerX === 0 || centerY === 0) {
    return null;
  }

  return (
    <div
      className="absolute flex flex-col items-center z-30"
      style={{
        left: `${centerX}px`,
        top: `${controlsGroupTop}px`,
        transform: "translateX(-50%)",
      }}
    >
      {/* Zone Name Label */}
      <div className={`mb-2 text-lg font-bold ${zoneTitleColor}`}>
        {displayZoneId}
      </div>

      {/* Conditional Button (Node 5/6 vs Node 1/2) */}
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

      {/* Main Toggle Switch (Node 3/4 or Node 5/6) */}
      <button
        type="button"
        onClick={onToggleSwitch} // This is `handleMainToggleSwitch` from useCoreSiteData
        className={`relative inline-flex items-center h-9 rounded-full w-auto min-w-[300px] p-1
                    transition-colors duration-200 ease-in-out cursor-pointer group
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    ${
                      theme === "dark"
                        ? "focus:ring-offset-gray-800"
                        : "focus:ring-offset-white"
                    }
                    ${
                      theme === "dark"
                        ? "focus:ring-sky-500"
                        : "focus:ring-sky-600"
                    }
                    ${toggleTrackBg}`}
        role="switch"
        aria-checked={isMainToggleOption1Selected} // Based on dynamic logic
      >
        <span className="sr-only">Select Focused Node</span>
        <div className="absolute inset-0 flex items-center justify-around w-full px-1">
          {/* Use dynamic text props */}
          <span className={`text-xs font-medium ${toggleTrackText}`}>
            {mainToggleOption1Text}
          </span>
          <span className={`text-xs font-medium ${toggleTrackText}`}>
            {mainToggleOption2Text}
          </span>
        </div>
        <span
          aria-hidden="true"
          className={`pointer-events-none relative inline-flex items-center justify-center 
                      h-7 w-[calc(50%-4px)] rounded-full 
                      ${toggleThumbBg} shadow-md ring-0 
                      transform transition-transform duration-200 ease-in-out`}
          style={{
            transform: isMainToggleOption1Selected
              ? "translateX(0%)" // Option 1 (left) selected
              : "translateX(calc(100% + 4px))", // Option 2 (right) selected
          }}
        >
          <span className={`text-xs font-medium ${toggleThumbText}`}>
            {isMainToggleOption1Selected
              ? mainToggleOption1Text
              : mainToggleOption2Text}
          </span>
        </span>
      </button>
    </div>
  );
}
