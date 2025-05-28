// src/Sidebar.js (or wherever this file is located)
import React from "react";
import {
  MdDashboard,
  MdInsights, // Kept for reference, but not used in the reordered list
  MdAdminPanelSettings,
  MdSearch,     // Search Icon
  MdNotifications,
  MdHelp,
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
  // MdTrendingUp, // No longer needed if "Performance" is fully replaced by "Search"
} from "react-icons/md";
// Assuming DarkModeToggle is in src/components/DarkModeToggle.js
import { DarkModeToggle } from "../ui/dark-mode-toggle"; // Make sure this path is correct

// NavItem component
function NavItem({ label, icon, collapsed, active, onClick }) {
  return (
    <button
      onClick={() => onClick(label)}
      className={`flex items-center gap-3 text-sm px-3 py-2 rounded-md w-full transition
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
  // REORDERED navItems array
  const navItems = [
    { label: "Dashboard", icon: <MdDashboard size={20} /> },
    { label: "Search", icon: <MdSearch size={20} /> }, // Moved "Search" here
    { label: "Admin Panel", icon: <MdAdminPanelSettings size={20} /> },
    { label: "Notifications", icon: <MdNotifications size={20} /> },
  ];

  const footerItems = [
    { label: "Help", icon: <MdHelp size={20} /> },
    { label: "Settings", icon: <MdSettings size={20} /> },
  ];

  return (
    <div
      className={`h-screen ${
        collapsed ? "w-16" : "w-60"
      } bg-white dark:bg-gray-900 border-r dark:border-gray-700 shadow-sm flex flex-col transition-all duration-300`}
    >
      {/* Header & Toggle */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 shrink-0">
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
            onClick={setCurrentPage}
          />
        ))}
      </nav>

      {/* Footer Nav & Dark Mode Toggle */}
      <div className="px-2 py-2 border-t dark:border-gray-700 shrink-0">
        {footerItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            active={currentPage === item.label}
            onClick={setCurrentPage}
          />
        ))}
        <div className="mt-2">
         <DarkModeToggle collapsed={collapsed} />
        </div>
      </div>
    </div>
  );
}