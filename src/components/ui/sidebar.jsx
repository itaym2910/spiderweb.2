import React from "react";
// --- 1. Import Link from React Router ---
import { Link } from "react-router-dom";
import {
  MdDashboard,
  MdAdminPanelSettings,
  MdSearch,
  MdNotifications,
  MdHelp,
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { DarkModeToggle } from "../ui/dark-mode-toggle"; // Adjust path if necessary

// --- 2. Map labels to URL paths for clean routing ---
// This object translates the sidebar label into a URL path.
const navLinks = {
  Dashboard: "/", // The root path will show the dashboard
  Search: "/search",
  "Admin Panel": "/admin",
  Notifications: "/notifications",
  Help: "/help",
  Settings: "/settings",
};

/**
 * The NavItem is now a Link component. It navigates to a new URL
 * instead of setting state.
 */
function NavItem({ label, icon, collapsed, active }) {
  // --- 3. The root element is now a <Link> component ---
  return (
    <Link
      to={navLinks[label] || "/"} // Navigate to the path defined in our map
      className={`flex items-center gap-3 text-sm px-3 py-2 rounded-md w-full transition
    ${
      active
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white font-semibold"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`}
    >
      <span className="text-xl">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

/**
 * The main Sidebar component. It no longer manages page state, but receives
 * the current active page from its parent to correctly highlight the active link.
 */
// --- 4. `setCurrentPage` is removed from the props ---
export function Sidebar({ currentPage, collapsed, setCollapsed }) {
  const navItems = [
    { label: "Dashboard", icon: <MdDashboard size={20} /> },
    { label: "Search", icon: <MdSearch size={20} /> },
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
      {/* Header & Toggle Button (No changes here) */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 shrink-0">
        {!collapsed && (
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            SPIDERWEB
          </div>
        )}
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

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            active={currentPage === item.label}
            // `onClick` prop is no longer needed
          />
        ))}
      </nav>

      {/* Footer Navigation */}
      <div className="px-2 py-2 border-t dark:border-gray-700 shrink-0">
        {footerItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            active={currentPage === item.label}
            // `onClick` prop is no longer needed
          />
        ))}
        <div className="mt-2">
          <DarkModeToggle collapsed={collapsed} />
        </div>
      </div>
    </div>
  );
}
