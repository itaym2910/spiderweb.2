import React from "react";
import {
  MdDashboard,
  MdInsights,
  MdTrendingUp,
  MdNotifications,
  MdHelp,
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
// Assuming DarkModeToggle is in src/components/DarkModeToggle.js
import { DarkModeToggle } from "../ui/dark-mode-toggle";

// NavItem component (remains the same as your original)
function NavItem({ label, icon, collapsed, active, onClick }) {
  return (
    <button
      onClick={() => onClick(label)}
      className={`flex items-center gap-3 text-sm px-3 py-2 rounded-md w-full transition h-[full]
    ${
      active
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white font-semibold"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`}
    >
      <span className="text-xl">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

export function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed }) {
  const navItems = [
    { label: "Dashboard", icon: <MdDashboard size={20} /> },
    { label: "AI Insights", icon: <MdInsights size={20} /> },
    { label: "Performance", icon: <MdTrendingUp size={20} /> },
    { label: "Notifications", icon: <MdNotifications size={20} /> }, // This will set currentPage to "Notifications"
  ];

  const footerItems = [
    { label: "Help", icon: <MdHelp size={20} /> },
    { label: "Settings", icon: <MdSettings size={20} /> },
  ];

  return (
    <div
      className={`h-[full] ${
        collapsed ? "w-16" : "w-60"
      } bg-white dark:bg-gray-900 border-r dark:border-gray-700 shadow-sm flex flex-col transition-all duration-300`}
    >
      {/* Header & Toggle */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        {!collapsed && <div className="text-xl font-bold text-gray-800 dark:text-white">SpiderWeb</div>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          {collapsed ? (
            <MdChevronRight size={24} />
          ) : (
            <MdChevronLeft size={24} />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            active={currentPage === item.label}
            onClick={setCurrentPage} // Use setCurrentPage from props
          />
        ))}
      </nav>

      {/* Footer Nav & Dark Mode Toggle */}
      <div className="px-2 py-2 border-t dark:border-gray-700">
        {footerItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            active={currentPage === item.label}
            onClick={setCurrentPage} // Use setCurrentPage from props
          />
        ))}
        <div className="mt-2">
         <DarkModeToggle collapsed={collapsed} />
        </div>
      </div>
    </div>
  );
}