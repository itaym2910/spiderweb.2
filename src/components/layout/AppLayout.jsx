import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Star } from "lucide-react";

// Helper components & hooks
import { useDashboardLogic } from "../../pages/useDashboardLogic"; // Adjust path if needed
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"; // Adjust path if needed
import { Sidebar } from "../ui/sidebar"; // Adjust path if needed

// Page components
import { DashboardPage } from "../../pages/DashboardPage"; // Adjust path if needed
import { AdminPanelPage } from "../../pages/AdminPanelPage"; // Adjust path if needed
import { AlertsPage } from "../../pages/AlertsPage"; // Adjust path if needed
import SearchPage from "../../pages/SearchPage"; // Adjust path if needed

// Icons used for the fullscreen toggle in the header.
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

function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const location = useLocation();

  // THEME FIX: Create a reactive state for the theme.
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  // THEME FIX: Use an effect with a MutationObserver to listen for
  // class changes on the <html> element and update the theme state.
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const newTheme = document.documentElement.classList.contains("dark")
            ? "dark"
            : "light";
          setTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const activePageLabel = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/admin")) return "Admin Panel";
    if (path.startsWith("/search")) return "Search";
    if (path.startsWith("/notifications")) return "Alerts";
    if (path.startsWith("/help")) return "Help";
    if (path.startsWith("/settings")) return "Settings";
    return "Dashboard";
  }, [location.pathname]);

  const isDashboardActive = activePageLabel === "Dashboard";

  // This hook is now only responsible for tab navigation state.
  const dashboardLogic = useDashboardLogic({
    isAppFullscreen: isFullscreen,
    isSidebarCollapsed,
  });
  const { activeTabValue, handleTabChangeForNavigation } = dashboardLogic;

  const toggleFullscreen = () => {
    if (!isDashboardActive) return;
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    if (isFullscreen && !isDashboardActive) {
      setIsFullscreen(false);
    }
  }, [isFullscreen, isDashboardActive]);

  const renderFullscreenToggleButton = () => {
    if (!isDashboardActive) return null;

    const ButtonIcon = isFullscreen ? ExitFullscreenIcon : FullscreenIcon;
    const buttonTitle = isFullscreen ? "Exit Fullscreen" : "Fullscreen";

    return (
      <button
        onClick={toggleFullscreen}
        title={buttonTitle}
        aria-label={buttonTitle}
        className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <ButtonIcon className="w-5 h-5" />
      </button>
    );
  };

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
        <header
          className={`bg-white dark:bg-gray-800 shrink-0 flex flex-col sm:flex-row sm:items-center gap-4 ${
            isFullscreen
              ? "p-4 border-b dark:border-gray-700"
              : "shadow-sm p-4 mb-6 rounded-lg"
          }`}
        >
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white shrink-0">
            {activePageLabel}
          </h1>

          {isDashboardActive && (
            <>
              <div className="flex-1 flex justify-center">
                <Tabs
                  value={activeTabValue}
                  onValueChange={handleTabChangeForNavigation}
                  className="w-full md:w-[750px] lg:w-[800px]"
                >
                  <TabsList className="grid-cols-5">
                    <TabsTrigger
                      value="favorites"
                      className="flex items-center gap-1.5"
                    >
                      <Star className="h-4 w-4 text-yellow-500" /> Favorites
                    </TabsTrigger>
                    <TabsTrigger value="all_interfaces">
                      All Interfaces
                    </TabsTrigger>
                    <TabsTrigger value="l_network">L-chart</TabsTrigger>
                    <TabsTrigger value="p_network">P-chart</TabsTrigger>
                    <TabsTrigger value="site">Site</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {renderFullscreenToggleButton()}
            </>
          )}
        </header>

        <div className="flex-1 min-h-0">
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
            <Route
              path="/*"
              element={
                <DashboardPage
                  isAppFullscreen={isFullscreen}
                  activeTabValue={activeTabValue}
                  // Pass the new, reactive theme state as a prop.
                  theme={theme}
                  popupAnchorCoords={dashboardLogic.popupAnchorCoords}
                  chartKeySuffix={dashboardLogic.chartKeySuffix}
                />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
