// src/MainPage.js
import React from "react";
import { DashboardPage } from "./DashboardPage";
import { AlertsPage } from "./AlertsPage";
import { AdminPanelPage } from "./AdminPanelPage";
import SearchPage from "./SearchPage";

// Receive isFullscreen and isSidebarCollapsed from App.js
function MainPage({ currentPage, isFullscreen, isSidebarCollapsed }) {
  // console.log("Current page in MainPage:", currentPage);
  // console.log("Is Fullscreen in MainPage:", isFullscreen);
  // console.log("Is Sidebar Collapsed in MainPage:", isSidebarCollapsed);

  const renderContent = () => {
    switch (currentPage) {
      case "Dashboard":
        // Pass isFullscreen and isSidebarCollapsed to DashboardPage
        return (
          <DashboardPage
            isAppFullscreen={isFullscreen}
            isSidebarCollapsed={isSidebarCollapsed}
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
          />
        );
    }
  };

  return <>{renderContent()}</>;
}

export default MainPage;
