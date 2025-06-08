// src/MainPage.js
import React from "react";
import { DashboardPage } from "./DashboardPage";
import { AlertsPage } from "./AlertsPage";
import { AdminPanelPage } from "./AdminPanelPage";
import SearchPage from "./SearchPage";

// Receive isFullscreen from App.js
function MainPage({ currentPage, isFullscreen }) {
  // console.log("Current page in MainPage:", currentPage);
  // console.log("Is Fullscreen in MainPage:", isFullscreen);

  const renderContent = () => {
    switch (currentPage) {
      case "Dashboard":
        // Pass isFullscreen to DashboardPage
        return <DashboardPage isAppFullscreen={isFullscreen} />;
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
        // console.log("Defaulting to DashboardPage because currentPage is:", currentPage);
        // Pass isFullscreen to DashboardPage here too for default case
        return <DashboardPage isAppFullscreen={isFullscreen} />;
    }
  };

  return <>{renderContent()}</>;
}

export default MainPage;
