// src/components/layout/AppLayout.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Star } from "lucide-react";

// Helper components & hooks
import { useDashboardLogic } from "../../pages/useDashboardLogic"; // Adjust path if needed
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"; // Adjust path if needed
import { Sidebar } from "../ui/sidebar"; // Adjust path if needed

// Page components
import { DashboardPage } from "../../pages/DashboardPage"; // Adjust path if needed
import { AdminPanelPage } from "../../pages/AdminPanelPage"; // Adjust path if needed
import { AlertsPage } from "../../pages/AlertsPage"; // Adjust path if needed
import SearchPage from "../../pages/SearchPage"; // Adjust path if needed

// You can keep the Icon components here or move them to their own file
export const FullscreenIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9.75 9.75M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L14.25 9.75M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9.75 14.25m10.5 6.05v-4.5m0 4.5h-4.5m4.5 0L14.25 14.25"
    />
  </svg>
);
export const ExitFullscreenIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25"
    />
  </svg>
);

/**
 * AppLayout manages the main application structure: Sidebar, Header, and the main content area.
 * It now also manages the Dashboard's tab state because the tab controls
 * have been moved into its header.
 */
function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const location = useLocation();

  const activePageLabel = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/admin")) return "Admin Panel";
    if (path.startsWith("/search")) return "Search";
    if (path.startsWith("/notifications")) return "Alerts";
    if (path.startsWith("/help")) return "Help";
    if (path.startsWith("/settings")) return "Settings";
    return "Dashboard";
  }, [location.pathname]);

  const isDashboardActive = activePageLabel === "Dashboard";

  // The logic for tab state and navigation now lives here.
  const dashboardLogic = useDashboardLogic({
    isAppFullscreen: isFullscreen,
    isSidebarCollapsed,
  });

  const { activeTabValue, handleTabChangeForNavigation } = dashboardLogic;

  // Fullscreen logic
  const toggleFullscreen = () => {
    if (!isDashboardActive) return;
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    if (isFullscreen && !isDashboardActive) {
      setIsFullscreen(false);
    }
  }, [isFullscreen, isDashboardActive]);

  return (
    <div className="flex min-h-[100vh] bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors">
      {!isFullscreen && (
        <Sidebar
          currentPage={activePageLabel}
          collapsed={isSidebarCollapsed}
          setCollapsed={setIsSidebarCollapsed}
        />
      )}
      <main
        className={`flex-1 flex flex-col overflow-y-auto relative ${
          isFullscreen ? "p-0" : "p-4 md:p-6"
        }`}
      >
        {!isFullscreen && (
          <header className="bg-white dark:bg-gray-800 shadow-sm p-4 mb-6 rounded-lg shrink-0 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {activePageLabel}
            </h1>

            {/* Conditionally render dashboard tabs here */}
            {isDashboardActive && (
              <Tabs
                value={activeTabValue}
                onValueChange={handleTabChangeForNavigation}
                className="flex-shrink-0"
              >
                <TabsList className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  <TabsTrigger
                    value="favorites"
                    className="flex items-center gap-1"
                  >
                    <Star className="h-4 w-4 text-yellow-500" /> Favorites
                  </TabsTrigger>
                  <TabsTrigger value="all_interfaces">
                    All Interfaces
                  </TabsTrigger>
                  <TabsTrigger value="l_network">L-chart</TabsTrigger>
                  <TabsTrigger value="p_network">P-chart</TabsTrigger>
                  <TabsTrigger value="site">Site</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </header>
        )}

        <div className="flex-1 min-h-0">
          <Routes>
            <Route path="/admin" element={<AdminPanelPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/notifications" element={<AlertsPage />} />
            <Route
              path="/help"
              element={
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                  Help Page Content
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                  Settings Page Content
                </div>
              }
            />

            <Route
              path="/*"
              element={
                <DashboardPage
                  isAppFullscreen={isFullscreen}
                  isSidebarCollapsed={isSidebarCollapsed}
                  toggleAppFullscreen={toggleFullscreen}
                  isFullscreenActive={isFullscreen}
                  activeTabValue={activeTabValue}
                  chartKeySuffix={dashboardLogic.chartKeySuffix}
                  theme={dashboardLogic.theme}
                  popupAnchorCoords={dashboardLogic.popupAnchorCoords}
                  enterFullscreenButtonClasses="text-gray-600 hover:bg-gray-100"
                  exitFullscreenButtonClasses="bg-gray-200 text-gray-700"
                />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// NOTE: We need to export AppLayout as the default export from this file
export default AppLayout;
