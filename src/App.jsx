// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Sidebar } from "./components/ui/sidebar";
import MainPage from "./MainPage";

// SVG Icon for Fullscreen (Expand)
const FullscreenIcon = ({ className = "w-5 h-5" }) => (
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

// SVG Icon for Exit Fullscreen (Compress)
const ExitFullscreenIcon = ({ className = "w-5 h-5" }) => (
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

function App() {
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAppDarkTheme, setIsAppDarkTheme] = useState(
    document.documentElement.classList.contains("dark")
  );

  let pageTitle = currentPage;
  if (currentPage === "Notifications") {
    pageTitle = "Alerts";
  }

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsAppDarkTheme(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen && currentPage !== "Dashboard") {
      return;
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    if (isFullscreen && currentPage !== "Dashboard") {
      setIsFullscreen(false);
    }
  }, [currentPage, isFullscreen]);

  // Determine button classes based on theme
  const exitFullscreenButtonClasses = isAppDarkTheme
    ? "bg-gray-700 text-white hover:bg-gray-600" // Dark theme classes
    : "bg-gray-200 text-gray-700 hover:bg-gray-300"; // Light theme classes

  const enterFullscreenButtonClasses = isAppDarkTheme
    ? "text-gray-300 hover:bg-gray-700"
    : "text-gray-600 hover:bg-gray-100";

  return (
    <BrowserRouter>
      <div className="flex min-h-[100vh] bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors">
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
            isFullscreen ? "p-0" : "p-4 md:p-6"
          }`}
        >
          {!isFullscreen && (
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4 mb-6 rounded-lg flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {pageTitle}
              </h1>
              {currentPage === "Dashboard" && !isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${enterFullscreenButtonClasses}`}
                  aria-label="Enter fullscreen chart view"
                  title="Fullscreen Chart"
                >
                  <FullscreenIcon className="w-5 h-5" />
                </button>
              )}
            </header>
          )}

          {isFullscreen && currentPage === "Dashboard" && (
            <button
              onClick={toggleFullscreen}
              className={`absolute top-2 right-4 z-[100] p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-opacity-50 ${exitFullscreenButtonClasses}`}
              aria-label="Exit fullscreen chart view"
              title="Exit Fullscreen"
            >
              <ExitFullscreenIcon className="w-5 h-5" />
            </button>
          )}

          <MainPage
            currentPage={currentPage}
            isFullscreen={isFullscreen}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
