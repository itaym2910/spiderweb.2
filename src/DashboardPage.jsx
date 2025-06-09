// src/DashboardPage.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { Card, CardContent } from "./components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";

import NetworkVisualizerWrapper from "./components/NetworkVisualizerWrapper";
import NetworkVisualizer5Wrapper from "./components/NetworkVisualizer5Wrapper";
import CoreSitePage from "./components/CoreSite/CoreSitePage"; // Ensure path is correct
import { data } from "./dataMainLines";

// Accept isSidebarCollapsed prop
export function DashboardPage({ isAppFullscreen, isSidebarCollapsed }) {


  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const observer = new MutationObserver(() => { // Corrected line: removed the rogue underscore
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);


  const handleTabChange = () => {
    const currentPath = location.pathname;
    const isOnLZoneDetail = currentPath.includes("/l-zone/");
    const isOnPZoneDetail = currentPath.includes("/p-zone/");

    if (isOnLZoneDetail || isOnPZoneDetail) {
      let calculatedBasePath = currentPath;
      if (isOnLZoneDetail) {
        const parts = currentPath.split("/l-zone/");
        calculatedBasePath = parts[0];
      } else if (isOnPZoneDetail) {
        const parts = currentPath.split("/p-zone/");
        calculatedBasePath = parts[0];
      }
      if (calculatedBasePath === "" || calculatedBasePath === undefined) {
        calculatedBasePath = "/";
      }
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

  // Construct a dynamic key for charts based on both fullscreen and sidebar state
  const chartKeySuffix = `${isAppFullscreen}-${isSidebarCollapsed}`;


  return (
    <div
      className={`flex flex-col h-full p-0 ${
        isAppFullscreen
          ? "bg-white dark:bg-gray-800"
          : "bg-white dark:bg-gray-800 rounded-lg shadow-md"
      }`}
    >
      <Tabs
        defaultValue="table"
        className="w-full flex flex-col flex-1"
        onValueChange={handleTabChange}
      >
        <TabsList
          className={`bg-gray-100 dark:bg-gray-700 p-1 rounded-lg ${
            isAppFullscreen ? "mx-0 my-0 rounded-none" : "mb-4"
          }`}
        >
          <TabsTrigger value="table">Main Lines</TabsTrigger>
          <TabsTrigger value="l_network">L-chart</TabsTrigger>
          <TabsTrigger value="p_network">P-chart</TabsTrigger>
        </TabsList>


        <TabsContent value="table" className="flex-1 flex flex-col min-h-0">
          {/* ... Table Card ... */}
          <Card
            className={`flex-1 flex flex-col min-h-0 ${
              isAppFullscreen
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`overflow-auto flex-1 ${
                isAppFullscreen ? "p-0" : "p-4"
              }`}
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
            className={`flex-1 flex flex-col min-h-0 ${
              isAppFullscreen
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`flex-1 flex flex-col min-h-0 ${
                isAppFullscreen ? "p-0" : "p-4"
              }`}
            >
              <div className="relative w-full flex-1 min-h-0">
                <Routes>
                  <Route
                    index
                    element={
                      <NetworkVisualizerWrapper
                        key={`l-visualizer-${chartKeySuffix}`} // Updated key
                        data={data}
                        theme={theme}
                      />
                    }
                  />
                  <Route
                    path="l-zone/:zoneId"
                    element={<CoreSitePage theme={theme} />} // Pass theme to CoreSitePage
                  />
                </Routes>

              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="p_network" className="flex-1 flex flex-col min-h-0">
          <Card
            className={`flex-1 flex flex-col min-h-0 ${
              isAppFullscreen
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`flex-1 flex flex-col min-h-0 ${
                isAppFullscreen ? "p-0" : "p-4"
              }`}
            >
              <div className="relative w-full flex-1 min-h-0">
                <Routes>
                  <Route
                    index
                    element={
                      <NetworkVisualizer5Wrapper
                        key={`p-visualizer-${chartKeySuffix}`} // Updated key
                        data={data}
                        theme={theme}
                      />
                    }
                  />
                  <Route
                    path="p-zone/:zoneId"
                    element={<CoreSitePage theme={theme} />} // Pass theme to CoreSitePage
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