// src/MainPage.js
import React from "react";
import { DashboardPage } from "./pages/DashboardPage";
import { AlertsPage } from "./pages/AlertsPage";
import { AdminPanelPage } from "./pages/AdminPanelPage";
import SearchPage from "./pages/SearchPage";

function MainPage({
  currentPage,
  isFullscreen,
  isSidebarCollapsed,
  // --- RECEIVE PROPS FOR FULLSCREEN BUTTON ---
  toggleFullscreen,
  isAppDarkTheme,
  enterFullscreenButtonClasses,
  exitFullscreenButtonClasses,
  // --- END RECEIVE PROPS ---
}) {
  const renderContent = () => {
    switch (currentPage) {
      case "Dashboard":
        return (
          <DashboardPage
            isAppFullscreen={isFullscreen} // Renamed prop in DashboardPage
            isSidebarCollapsed={isSidebarCollapsed}
            // --- PASS PROPS TO DASHBOARDPAGE ---
            toggleAppFullscreen={toggleFullscreen} // Pass the toggle function
            isFullscreenActive={isFullscreen} // Pass the current state
            isAppDarkTheme={isAppDarkTheme}
            enterFullscreenButtonClasses={enterFullscreenButtonClasses}
            exitFullscreenButtonClasses={exitFullscreenButtonClasses}
            // --- END PASS PROPS ---
          />
        );
      case "Search":
        return <SearchPage />;
      case "Notifications":
        return <AlertsPage />;
      case "Admin Panel":
        return <AdminPanelPage />;
      case "Help":
        return (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            Help Page Content Placeholder
          </div>
        );
      case "Settings":
        return (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            Settings Page Content Placeholder
          </div>
        );
      default:
        // Pass relevant props to DashboardPage here too for default case
        return (
          <DashboardPage
            isAppFullscreen={isFullscreen}
            isSidebarCollapsed={isSidebarCollapsed}
            // --- PASS PROPS TO DASHBOARDPAGE (DEFAULT) ---
            toggleAppFullscreen={toggleFullscreen}
            isFullscreenActive={isFullscreen}
            isAppDarkTheme={isAppDarkTheme}
            enterFullscreenButtonClasses={enterFullscreenButtonClasses}
            exitFullscreenButtonClasses={exitFullscreenButtonClasses}
            // --- END PASS PROPS (DEFAULT) ---
          />
        );
    }
  };

  return <>{renderContent()}</>;
}

export default MainPage;
