// src/DashboardPage.js
import React, { useState, useEffect, useRef } from "react";
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

  const tabContentCardRef = useRef(null);
  const [popupAnchorCoords, setPopupAnchorCoords] = useState({
    top: 20,
    right: 20,
  });

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

  useEffect(() => {
    const updateAnchor = () => {
      if (tabContentCardRef.current) {
        const rect = tabContentCardRef.current.getBoundingClientRect();

        setPopupAnchorCoords({
          top: rect.top,
          right: window.innerWidth - rect.right,
        });
      } else {
        const appHeader = document.querySelector("header");
        const mainPadding = 24;
        setPopupAnchorCoords({
          top:
            (appHeader ? appHeader.getBoundingClientRect().bottom : 0) +
            mainPadding,
          right: mainPadding,
        });
      }
    };

    updateAnchor();

    window.addEventListener("resize", updateAnchor);
    return () => {
      window.removeEventListener("resize", updateAnchor);
    };
  }, [activeTabValue, isAppFullscreen, isSidebarCollapsed]);

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

    const buttonPositionClasses = isAppFullscreen
      ? "top-2 left-2"
      : "top-2 left-2";

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
        isAppFullscreen
          ? "bg-white dark:bg-gray-800"
          : "bg-white dark:bg-gray-800 rounded-lg shadow-md"
      } ${isAppFullscreen ? "p-0" : ""}`}
    >
      <Tabs
        defaultValue="table"
        className="w-full flex flex-col flex-1"
        onValueChange={handleTabChangeForNavigation}
      >
        <TabsList
          className={`bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4 ${
            isAppFullscreen ? "mx-0 mt-0 rounded-none sticky top-0 z-40" : "" // Sticky if fullscreen
          }`}
        >
          <TabsTrigger value="table">Main Lines</TabsTrigger>
          <TabsTrigger value="l_network">L-chart</TabsTrigger>
          <TabsTrigger value="p_network">P-chart</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="flex-1 flex flex-col min-h-0">
          <Card
            ref={activeTabValue === "table" ? tabContentCardRef : null}
            className={`flex-1 flex flex-col min-h-0 ${
              isAppFullscreen && activeTabValue === "table"
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`overflow-auto flex-1 ${
                isAppFullscreen && activeTabValue === "table" ? "p-4" : "p-4"
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
          <Card
            ref={activeTabValue === "l_network" ? tabContentCardRef : null}
            className={`flex-1 flex flex-col min-h-0 ${
              isAppFullscreen && activeTabValue === "l_network"
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`flex-1 flex flex-col min-h-0 ${
                isAppFullscreen && activeTabValue === "l_network"
                  ? "p-0"
                  : "p-4"
              } relative`}
            >
              {activeTabValue === "l_network" && renderFullscreenToggleButton()}
              <div className="relative w-full flex-1 min-h-0">
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
                    element={
                      <CoreSitePage
                        theme={theme}
                        popupAnchor={popupAnchorCoords}
                      />
                    }
                  />
                </Routes>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="p_network" className="flex-1 flex flex-col min-h-0">
          <Card
            ref={activeTabValue === "p_network" ? tabContentCardRef : null}
            className={`flex-1 flex flex-col min-h-0 ${
              isAppFullscreen && activeTabValue === "p_network"
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`flex-1 flex flex-col min-h-0 ${
                isAppFullscreen && activeTabValue === "p_network"
                  ? "p-0"
                  : "p-4"
              } relative`}
            >
              {activeTabValue === "p_network" && renderFullscreenToggleButton()}
              <div className="relative w-full flex-1 min-h-0">
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
                    element={
                      <CoreSitePage
                        theme={theme}
                        popupAnchor={popupAnchorCoords}
                      />
                    }
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
