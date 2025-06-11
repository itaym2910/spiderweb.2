// src/components/CoreSite/CoreSiteControls.jsx
import React from "react";

export default function CoreSiteControls({
  theme,
  centerX,
  centerY,
  displayZoneId,
  selectedNodeId,
  onToggleSwitch, // Renamed from setSelectedNodeId for clarity of action
  node4Text,
  node3Text,
  zoneId,
}) {
  const toggleTrackBg = theme === "dark" ? "bg-gray-700" : "bg-gray-200";
  const toggleThumbBg = theme === "dark" ? "bg-sky-600" : "bg-sky-500";
  const toggleThumbText = theme === "dark" ? "text-white" : "text-white";
  const toggleTrackText = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const zoneTitleColor = theme === "dark" ? "text-white" : "text-sky-800";

  const newButtonBg =
    theme === "dark"
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-indigo-500 hover:bg-indigo-600";
  const newButtonText = "text-white";

  const controlsGroupTop = centerY - 250;
  const isNode4Selected = selectedNodeId === "Node 4";

  const showNewButton = zoneId === "Zone 5" || zoneId === "Zone 6";

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

      {/* Conditionally Rendered "Node 5 and Node 6" Button */}
      {showNewButton && (
        <button
          type="button"
          // onClick={() => console.log("'Node 5 and Node 6' button clicked")} // Placeholder onClick
          className={`mb-3 px-4 py-2 rounded-md text-sm font-semibold shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-opacity-75
                      ${newButtonBg} ${newButtonText}
                      ${
                        theme === "dark"
                          ? "focus:ring-indigo-400 focus:ring-offset-gray-800"
                          : "focus:ring-indigo-500 focus:ring-offset-white"
                      }
                    `}
        >
          Node 5 and Node 6
        </button>
      )}

      {/* Toggle Switch for Node Selection */}
      <button
        type="button"
        onClick={onToggleSwitch}
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
        aria-checked={isNode4Selected}
      >
        <span className="sr-only">Select Focused Node</span>
        <div className="absolute inset-0 flex items-center justify-around w-full px-1">
          <span className={`text-xs font-medium ${toggleTrackText}`}>
            {node4Text}
          </span>
          <span className={`text-xs font-medium ${toggleTrackText}`}>
            {node3Text}
          </span>
        </div>
        <span
          aria-hidden="true"
          className={`pointer-events-none relative inline-flex items-center justify-center 
                      h-7 w-[calc(50%-4px)] rounded-full 
                      ${toggleThumbBg} shadow-md ring-0 
                      transform transition-transform duration-200 ease-in-out`}
          style={{
            transform: isNode4Selected
              ? "translateX(0%)"
              : "translateX(calc(100% + 4px))",
          }}
        >
          <span className={`text-xs font-medium ${toggleThumbText}`}>
            {isNode4Selected ? node4Text : node3Text}
          </span>
        </span>
      </button>
    </div>
  );
}
