import React, { useState, useEffect, useMemo } from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Component & Page Imports
import { Sidebar } from "./components/ui/sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPanelPage } from "./pages/AdminPanelPage";
import { AlertsPage } from "./pages/AlertsPage";
import SearchPage from "./pages/SearchPage";

// --- NOTE: These SVG components could be moved to a dedicated file for cleanliness ---
export const FullscreenIcon = ({ className = "w-5 h-5" }) => (
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

export const ExitFullscreenIcon = ({ className = "w-5 h-5" }) => (
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

/**
 * AppLayout is a new component that manages the main application structure.
 * It contains the Sidebar and the main content area where pages are routed.
 * It's responsible for managing UI state like sidebar collapse and fullscreen.
 */
function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const location = useLocation(); // Hook to get the current URL path

  // --- REPLACED `currentPage` state ---
  // We now derive the active page label directly from the URL.
  // This ensures the UI is always in sync with the URL.
  const activePageLabel = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/admin")) return "Admin Panel";
    if (path.startsWith("/search")) return "Search";
    if (path.startsWith("/notifications")) return "Alerts"; // Use a consistent title
    if (path.startsWith("/help")) return "Help";
    if (path.startsWith("/settings")) return "Settings";
    // Default for "/", "/sites", "/l-chart", etc.
    return "Dashboard";
  }, [location.pathname]);

  const isDashboardActive = activePageLabel === "Dashboard";

  // Fullscreen logic is now based on the derived active page
  const toggleFullscreen = () => {
    if (!isDashboardActive) return;
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    // Automatically exit fullscreen if we navigate away from the dashboard
    if (isFullscreen && !isDashboardActive) {
      setIsFullscreen(false);
    }
  }, [isFullscreen, isDashboardActive]);

  return (
    <div className="flex min-h-[100vh] bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors">
      {!isFullscreen && (
        <Sidebar
          currentPage={activePageLabel}
          collapsed={isSidebarCollapsed}
          setCollapsed={setIsSidebarCollapsed}
        />
      )}
      <main
        className={`flex-1 flex flex-col overflow-y-auto relative ${
          isFullscreen ? "p-0" : "p-4 md:p-6"
        }`}
      >
        {/* The Header is now part of the main layout, displayed for all pages */}
        {!isFullscreen && (
          <header className="bg-white dark:bg-gray-800 shadow-sm p-4 mb-6 rounded-lg shrink-0">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {activePageLabel}
            </h1>
          </header>
        )}

        {/* This wrapper ensures the routed content fills the remaining vertical space */}
        <div className="flex-1 min-h-0">
          {/*
            The <Routes> component is the new "page switcher", replacing MainPage.js.
            It listens to the URL and renders the matching component.
          */}
          <Routes>
            <Route path="/admin" element={<AdminPanelPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/notifications" element={<AlertsPage />} />
            <Route
              path="/help"
              element={
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                  Help Page Content
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                  Settings Page Content
                </div>
              }
            />

            {/*
              The wildcard route "/*" acts as the default. It matches anything not
              explicitly matched above (e.g., '/', '/sites', '/l-chart').
              This is where we render the DashboardPage, which has its own
              internal router to handle its tabs.
            */}
            <Route
              path="/*"
              element={
                <DashboardPage
                  isAppFullscreen={isFullscreen}
                  isSidebarCollapsed={isSidebarCollapsed}
                  toggleAppFullscreen={toggleFullscreen}
                  isFullscreenActive={isFullscreen}
                  enterFullscreenButtonClasses="text-gray-600 hover:bg-gray-100"
                  exitFullscreenButtonClasses="bg-gray-200 text-gray-700"
                />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

/**
 * The root App component. Its only job is to set up the global providers
 * for Redux (state management) and React Router (navigation).
 */
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
