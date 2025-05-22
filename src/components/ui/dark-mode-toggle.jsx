import React, { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export function DarkModeToggle({ collapsed }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    const isNowDark = !isDark;
    document.documentElement.classList.toggle("dark", isNowDark);
    setIsDark(isNowDark);
  };

  const Icon = isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />;
  const label = isDark ? "Light Mode" : "Dark Mode";

  return (
    <button
      onClick={toggleDark}
      className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md w-full transition"
    >
      <span className="text-xl">{Icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}
