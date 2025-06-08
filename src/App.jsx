// App.js
import React, { useState, useEffect } from "react"; // Import useEffect
import { BrowserRouter } from "react-router-dom";
import { Sidebar } from "./components/ui/sidebar";
import MainPage from "./MainPage";

function App() {
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false); // State for fullscreen

  let pageTitle = currentPage;
  if (currentPage === "Notifications") {
    pageTitle = "Alerts";
  }

  // Function to toggle fullscreen
  const toggleFullscreen = () => {
    // Prevent entering fullscreen if not on Dashboard (though button is conditional)
    if (!isFullscreen && currentPage !== "Dashboard") {
      return;
    }
    setIsFullscreen(!isFullscreen);
  };

  // Effect to automatically exit fullscreen if navigating away from Dashboard
  useEffect(() => {
    if (isFullscreen && currentPage !== "Dashboard") {
      setIsFullscreen(false);
    }
  }, [currentPage, isFullscreen]);

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
          className={`flex-1 overflow-y-hidden relative ${
            // Added relative for positioning back button
            isFullscreen ? "p-0" : "p-4 md:p-6" // Remove padding in fullscreen
          }`}
        >
          {/* Conditionally render Header */}
          {!isFullscreen && (
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4 mb-6 rounded-lg flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {pageTitle}
              </h1>
              {/* Show Fullscreen button only on Dashboard page when not already fullscreen */}
              {currentPage === "Dashboard" && !isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  aria-label="Enter fullscreen chart view"
                >
                  Fullscreen Chart
                </button>
              )}
            </header>
          )}

          {/* Show "Back to place" button only when fullscreen AND on the Dashboard page */}
          {isFullscreen && currentPage === "Dashboard" && (
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-[100] px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              aria-label="Exit fullscreen chart view"
            >
              Back to place
            </button>
          )}

          {/* Pass fullscreen state to MainPage */}
          <MainPage
            currentPage={currentPage}
            isFullscreen={isFullscreen}
            // toggleFullscreen is handled by buttons in App.js directly
          />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
