import React, { useState } from "react";
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
import { DarkModeToggle } from "./dark-mode-toggle";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const navItems = [
    { label: "Dashboard", icon: <MdDashboard size={20} /> },
    { label: "AI Insights", icon: <MdInsights size={20} /> },
    { label: "Performance", icon: <MdTrendingUp size={20} /> },
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
      <div className="flex items-center justify-between p-4">
        {!collapsed && <div className="text-xl font-bold">SpiderWeb</div>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-900"
        >
          {collapsed ? (
            <MdChevronRight size={20} />
          ) : (
            <MdChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col space-y-2 px-2">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            active={activeTab === item.label}
            onClick={setActiveTab}
          />
        ))}
      </nav>

      <div className="mt-auto px-2 pt-4 border-t dark:border-gray-700">
        {footerItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            active={activeTab === item.label}
            onClick={setActiveTab}
          />
        ))}

        <DarkModeToggle collapsed={collapsed} />
      </div>
    </div>
  );
}

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
      {!collapsed && <span>{label}</span>}
    </button>
  );
}
