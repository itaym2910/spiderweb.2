// src/chart/ToggleDetailButton.js
import React from "react";

const ToggleDetailButton = ({ isDetailed, onToggle, theme }) => {
  const isDark = theme === "dark";

  const baseClasses =
    "absolute top-4 right-4 z-10 px-4 py-2 text-sm font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  const lightThemeClasses =
    "bg-white text-gray-700 hover:bg-gray-100 focus:ring-blue-500";
  const darkThemeClasses =
    "bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-blue-400 focus:ring-offset-gray-800";

  const buttonText = isDetailed ? "Show Summary View" : "Show Detailed Links";

  return (
    <button
      onClick={onToggle}
      className={`${baseClasses} ${
        isDark ? darkThemeClasses : lightThemeClasses
      }`}
      aria-live="polite"
    >
      {buttonText}
    </button>
  );
};

export default ToggleDetailButton;
