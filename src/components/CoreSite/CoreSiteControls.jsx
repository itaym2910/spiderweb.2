import React from "react";

export default function CoreSiteControls({
  theme,
  displayZoneId,
  onToggleExtendedNodes,
  showExtendedNodes,
  devicesInZoneCount,
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

  const zoneTitleColor = theme === "dark" ? "text-white" : "text-sky-800";

  // --- Dynamic Visibility & Text ---
  // The button is visible only if there are more than 4 devices, allowing for a second "page" of nodes.
  const isConditionalButtonVisible = devicesInZoneCount > 4;

  const conditionalButtonActualText = showExtendedNodes
    ? "Show First 4 Devices"
    : "Show More Devices";

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
    </div>
  );
}
