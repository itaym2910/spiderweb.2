// App.js
import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Sidebar } from "./components/ui/sidebar";
import MainPage from "./MainPage";

function App() {
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false); // New state for fullscreen

  let pageTitle = currentPage;
  if (currentPage === "Notifications") {
    pageTitle = "Alerts";
  }

  // Function to toggle fullscreen, can be passed down
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-[100vh] bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors">
        {/* Conditionally render Sidebar */}
        {!isFullscreen && (
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            collapsed={isSidebarCollapsed}
            setCollapsed={setIsSidebarCollapsed}
          />
        )}
        <main
          className={`flex-1 overflow-y-hidden ${
            isFullscreen ? "p-0" : "p-4 md:p-6" // Remove padding in fullscreen
          }`}
        >
          {/* Conditionally render Header */}
          {!isFullscreen && (
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4 mb-6 rounded-lg">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {pageTitle}
              </h1>
            </header>
          )}
          {/* Pass fullscreen state and toggle function to MainPage */}
          <MainPage
            currentPage={currentPage}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
          />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
