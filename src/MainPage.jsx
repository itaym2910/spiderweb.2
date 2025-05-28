// src/MainPage.js
import React from "react";
import { DashboardPage } from "./DashboardPage";
import { AlertsPage } from "./AlertsPage";
import { AdminPanelPage } from "./AdminPanelPage";
import SearchPage from "./SearchPage"; // <-- IMPORT THE NEW PAGE

function MainPage({ currentPage }) {
  console.log("Current page in MainPage:", currentPage);

  const renderContent = () => {
    switch (currentPage) {
      case "Dashboard":
        return <DashboardPage />;
      case "Search": // Make sure this matches the label in Sidebar
        return <SearchPage />; // <-- USE THE SEARCH PAGE
      case "Notifications":
        return <AlertsPage />;
      case "Admin Panel":
        return <AdminPanelPage />;
      case "Help":
        return <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">Help Page Content Placeholder</div>;
      case "Settings":
        return <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">Settings Page Content Placeholder</div>;
      default:
        console.log("Defaulting to DashboardPage because currentPage is:", currentPage);
        return <DashboardPage />;
    }
  };

  return <>{renderContent()}</>;
}

export default MainPage;