import React, { useState } from "react";
import { Sidebar } from "./components/ui/sidebar"; // Your existing path
import MainPage from "./MainPage"; // This will become our content router

function App() {
  const [currentPage, setCurrentPage] = useState("Dashboard"); // Default page
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Determine the title for the header based on the current page
  let pageTitle = currentPage;
  if (currentPage === "Notifications") {
    pageTitle = "Alerts"; // Display "Alerts" when Notifications tab is active
  }

  return (
    <div className="flex min-h-[100vh] bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        collapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
      />
      <main className="flex-1 p-4 md:p-6 overflow-y-hidden">
        {/* Optional: Header for the main content area */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 mb-6 rounded-lg">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {pageTitle}
          </h1>
        </header>
        <MainPage currentPage={currentPage} />
      </main>
    </div>
  );
}

export default App;