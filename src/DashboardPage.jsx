// src/DashboardPage.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { Card, CardContent } from "./components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "./components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import NetworkVisualizerWrapper from "./components/NetworkVisualizerWrapper";
import NetworkVisualizer5Wrapper from "./components/NetworkVisualizer5Wrapper";
import CoreSitePage from "./components/CoreSite/CoreSitePage";
import { data } from "./dataMainLines";
import { FullscreenIcon, ExitFullscreenIcon } from "./App"; // Adjust path if App.js is elsewhere

export function DashboardPage({
  isAppFullscreen,
  isSidebarCollapsed,
  toggleAppFullscreen,
  isFullscreenActive,
  enterFullscreenButtonClasses,
  exitFullscreenButtonClasses,
}) {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [activeTabValue, setActiveTabValue] = useState("table");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handleTabChangeForNavigation = (newTab) => {
    setActiveTabValue(newTab);

    const currentPath = location.pathname;
    const isOnLZoneDetail = currentPath.includes("/l-zone/");
    const isOnPZoneDetail = currentPath.includes("/p-zone/");

    if (isOnLZoneDetail || isOnPZoneDetail) {
      let calculatedBasePath = currentPath;
      if (isOnLZoneDetail) {
        calculatedBasePath = currentPath.split("/l-zone/")[0];
      } else if (isOnPZoneDetail) {
        calculatedBasePath = currentPath.split("/p-zone/")[0];
      }
      calculatedBasePath =
        calculatedBasePath === "" || calculatedBasePath === undefined
          ? "/"
          : calculatedBasePath;
      if (!calculatedBasePath.startsWith("/")) {
        calculatedBasePath = "/" + calculatedBasePath;
      }
      if (calculatedBasePath !== currentPath) {
        try {
          navigate(calculatedBasePath);
        } catch (e) {
          console.error("Navigation error in handleTabChange:", e);
        }
      }
    }
  };

  const chartKeySuffix = `${isAppFullscreen}-${isSidebarCollapsed}`;

  const renderFullscreenToggleButton = () => {
    if (!toggleAppFullscreen) return null;
    if (activeTabValue !== "l_network" && activeTabValue !== "p_network") {
      return null;
    }

    // Adjust button position if TabsList is always visible.
    // Top offset might need to be larger if TabsList takes significant height.
    // For now, keeping top-2 left-2 assuming CardContent has enough space.
    // If the CardContent itself is padded (e.g., p-4 not p-0 in fullscreen),
    // top-2 left-2 will be relative to that padding.
    // If CardContent becomes p-0, then top-2 left-2 is from the very edge of the card.
    const buttonPositionClasses = isAppFullscreen
      ? "top-2 left-2"
      : "top-2 left-2"; // Or adjust if CardContent padding changes

    if (isFullscreenActive) {
      return (
        <button
          onClick={toggleAppFullscreen}
          className={`absolute ${buttonPositionClasses} z-50 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-opacity-50 ${exitFullscreenButtonClasses}`}
          aria-label="Exit fullscreen chart view"
          title="Exit Fullscreen"
        >
          <ExitFullscreenIcon className="w-5 h-5" />
        </button>
      );
    } else {
      return (
        <button
          onClick={toggleAppFullscreen}
          className={`absolute ${buttonPositionClasses} z-50 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${enterFullscreenButtonClasses}`}
          aria-label="Enter fullscreen chart view"
          title="Fullscreen Chart"
        >
          <FullscreenIcon className="w-5 h-5" />
        </button>
      );
    }
  };

  return (
    <div
      className={`flex flex-col h-full ${
        isAppFullscreen // If app is fullscreen, the main wrapper might not need padding removed
          ? "bg-white dark:bg-gray-800" // Overall background for fullscreen dashboard area
          : "bg-white dark:bg-gray-800 rounded-lg shadow-md"
      } ${isAppFullscreen ? "p-0" : ""}`} // Outer div no longer needs p-0 if App.js main has p-0
    >
      <Tabs
        defaultValue="table"
        className="w-full flex flex-col flex-1" // flex-1 ensures Tabs fills the container
        onValueChange={handleTabChangeForNavigation}
      >
        {/* --- MODIFICATION: TabsList is ALWAYS visible --- */}
        <TabsList
          className={`bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4 ${
            isAppFullscreen ? "mx-0 mt-0 rounded-none sticky top-0 z-40" : "" // Sticky if fullscreen
          }`}
        >
          <TabsTrigger value="table">Main Lines</TabsTrigger>
          <TabsTrigger value="l_network">L-chart</TabsTrigger>
          <TabsTrigger value="p_network">P-chart</TabsTrigger>
        </TabsList>
        {/* --- END MODIFICATION --- */}

        <TabsContent value="table" className="flex-1 flex flex-col min-h-0">
          <Card
            className={`flex-1 flex flex-col min-h-0 ${
              isAppFullscreen && activeTabValue === "table" // Only special style if this tab is active in fullscreen
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`overflow-auto flex-1 ${
                isAppFullscreen && activeTabValue === "table" ? "p-4" : "p-4" // Table always has some padding
              } relative`}
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-b dark:border-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Phrase + [synonyms]
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Frequency
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Net sentiment
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Total impact
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, i) => (
                    <TableRow
                      key={i}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {item.phrase}{" "}
                        {item.synonyms ? `[${item.synonyms}]` : ""}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {item.frequency}
                      </TableCell>
                      <TableCell
                        className={`text-gray-700 dark:text-gray-300 ${
                          item.sentiment < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {item.sentiment.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-gray-700 dark:text-gray-300 font-semibold ${
                          item.impact < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {item.impact.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="l_network" className="flex-1 flex flex-col min-h-0">
          {" "}
          {/* Ensure content can fill space */}
          <Card
            className={`flex-1 flex flex-col min-h-0 ${
              // flex-1 allows card to grow
              isAppFullscreen && activeTabValue === "l_network" // Special styling only if this tab is active in fullscreen
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`flex-1 flex flex-col min-h-0 ${
                // flex-1 for content to grow
                isAppFullscreen && activeTabValue === "l_network"
                  ? "p-0"
                  : "p-4" // p-0 if active in fullscreen for max chart space
              } relative`}
            >
              {activeTabValue === "l_network" && renderFullscreenToggleButton()}
              <div className="relative w-full flex-1 min-h-0">
                {" "}
                {/* flex-1 for chart area */}
                <Routes>
                  <Route
                    index
                    element={
                      <NetworkVisualizerWrapper
                        key={`l-visualizer-${chartKeySuffix}`}
                        data={data}
                        theme={theme}
                      />
                    }
                  />
                  <Route
                    path="l-zone/:zoneId"
                    element={<CoreSitePage theme={theme} />}
                  />
                </Routes>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="p_network" className="flex-1 flex flex-col min-h-0">
          {" "}
          {/* Ensure content can fill space */}
          <Card
            className={`flex-1 flex flex-col min-h-0 ${
              // flex-1 allows card to grow
              isAppFullscreen && activeTabValue === "p_network" // Special styling only if this tab is active in fullscreen
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`flex-1 flex flex-col min-h-0 ${
                // flex-1 for content to grow
                isAppFullscreen && activeTabValue === "p_network"
                  ? "p-0"
                  : "p-4" // p-0 if active in fullscreen for max chart space
              } relative`}
            >
              {activeTabValue === "p_network" && renderFullscreenToggleButton()}
              <div className="relative w-full flex-1 min-h-0">
                {" "}
                {/* flex-1 for chart area */}
                <Routes>
                  <Route
                    index
                    element={
                      <NetworkVisualizer5Wrapper
                        key={`p-visualizer-${chartKeySuffix}`}
                        data={data}
                        theme={theme}
                      />
                    }
                  />
                  <Route
                    path="p-zone/:zoneId"
                    element={<CoreSitePage theme={theme} />}
                  />
                </Routes>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
