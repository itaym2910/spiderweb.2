// src/MainPage.js
import React from "react";
import { DashboardPage } from "./DashboardPage";
import { AlertsPage } from "./AlertsPage";
import { AdminPanelPage } from "./AdminPanelPage";
// ... other imports

function MainPage({ currentPage }) {
  console.log("Current page in MainPage:", currentPage); // <-- ADD THIS LINE

  const renderContent = () => {
    switch (currentPage) {
      case "Dashboard":
        return <DashboardPage />;
      case "Notifications":
        return <AlertsPage />;
      case "Admin Panel": // Make sure this string matches EXACTLY what's being set
        return <AdminPanelPage />;
      case "Performance":
        return <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">Performance Page Content Placeholder</div>;
      case "Help":
        return <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">Help Page Content Placeholder</div>;
      case "Settings":
        return <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">Settings Page Content Placeholder</div>;
      default:
        console.log("Defaulting to DashboardPage because currentPage is:", currentPage); // Optional: log why default is hit
        return <DashboardPage />;
    }
  };

  return <>{renderContent()}</>;
}

export default MainPage;