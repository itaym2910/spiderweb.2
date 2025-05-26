// src/MainPage.js
import React from "react";
import { DashboardPage } from "./DashboardPage"; // Changed import path
import { AlertsPage } from "./AlertsPage";       // Changed import path
// Import other page components as you create them, adjusting paths as needed:
// import { AiInsightsPage } from "./AiInsightsPage";
// import { PerformancePage } from "./PerformancePage";
// import { HelpPage } from "./HelpPage";
// import { SettingsPage } from "./SettingsPage";

function MainPage({ currentPage }) {
  const renderContent = () => {
    switch (currentPage) {
      case "Dashboard":
        return <DashboardPage />;
      case "Notifications":
        return <AlertsPage />;
      case "AI Insights":
        return <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">AI Insights Page Content Placeholder</div>;
      case "Performance":
        return <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">Performance Page Content Placeholder</div>;
      case "Help":
        return <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">Help Page Content Placeholder</div>;
      case "Settings":
        return <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">Settings Page Content Placeholder</div>;
      default:
        return <DashboardPage />;
    }
  };

  return <>{renderContent()}</>;
}

export default MainPage;