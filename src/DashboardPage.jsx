// src/DashboardPage.js
import React from "react";
import { Routes, Route, useParams, useLocation } from "react-router-dom";
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
import SiteDetailPage from "./components/end-site/SiteDetailPage";
import { data } from "./dataMainLines";
import { FullscreenIcon, ExitFullscreenIcon } from "./App";
import { useDashboardLogic } from "./useDashboardLogic";
import LinkTable from "./components/CoreDevice/LinkTable";
import { LINKS as L_CHART_LINKS } from "./components/chart/constants";
import { LINKS5 as P_CHART_LINKS } from "./components/chart/constants5";

function NodeDetailView({ chartType }) {
  const { nodeId } = useParams();
  const allLinks = chartType === "L" ? L_CHART_LINKS : P_CHART_LINKS;

  // Filter links where the source or target ID matches the nodeId
  const filteredLinks = allLinks.filter(
    (link) =>
      (link.source.id || link.source) === nodeId ||
      (link.target.id || link.target) === nodeId
  );

  return (
    <div className="p-1">
      {" "}
      {/* Optional: Add padding if LinkTable doesn't have enough */}
      <LinkTable coreDeviceName={nodeId} linksData={filteredLinks} />
    </div>
  );
}

export function DashboardPage({
  isAppFullscreen,
  isSidebarCollapsed,
  toggleAppFullscreen,
  isFullscreenActive,
  enterFullscreenButtonClasses,
  exitFullscreenButtonClasses,
}) {
  const {
    theme,
    activeTabValue,
    tabContentCardRef,
    popupAnchorCoords,
    handleTabChangeForNavigation,
    chartKeySuffix,
  } = useDashboardLogic({
    isAppFullscreen,
    isSidebarCollapsed,
  });
  const location = useLocation();

  const renderFullscreenToggleButton = () => {
    const isBaseNetworkView =
      !location.pathname.includes("/l-zone/") &&
      !location.pathname.includes("/p-zone/");
    if (!toggleAppFullscreen || !isBaseNetworkView) return null;
    if (activeTabValue !== "l_network" && activeTabValue !== "p_network") {
      return null;
    }
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
        value={activeTabValue} // Controlled by this state
        defaultValue="table" // Add this back for robust initial rendering
        className="w-full flex flex-col flex-1"
        onValueChange={handleTabChangeForNavigation}
      >
        <TabsList
          className={`bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4 ${
            isAppFullscreen ? "mx-0 mt-0 rounded-none sticky top-0 z-40" : ""
          }`}
        >
          <TabsTrigger value="table">Main Lines</TabsTrigger>
          <TabsTrigger value="l_network">L-chart</TabsTrigger>
          <TabsTrigger value="p_network">P-chart</TabsTrigger>
          <TabsTrigger value="site">Site</TabsTrigger>
        </TabsList>

        {/* Rest of the TabsContent remains the same */}
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
                  <Route
                    path="l-zone/:zoneId/node/:nodeId"
                    element={<NodeDetailView chartType="L" />}
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
                  <Route
                    path="p-zone/:zoneId/node/:nodeId"
                    element={<NodeDetailView chartType="P" />}
                  />
                </Routes>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="site" className="flex-1 flex flex-col min-h-0">
          <Card
            ref={activeTabValue === "site" ? tabContentCardRef : null}
            className={`flex-1 flex flex-col min-h-0 ${
              isAppFullscreen && activeTabValue === "site"
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`overflow-auto flex-1 ${
                isAppFullscreen && activeTabValue === "site" ? "p-0" : "p-0" // Changed to p-0 for full page component
              } relative`}
            >
              {/* <<< ADD ROUTES FOR SITE TAB >>> */}
              <Routes>
                <Route
                  index // Default view for the "Site" tab
                  element={
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                        Site Information
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300">
                        Select a site to view details or use the search
                        functionality.
                      </p>
                    </div>
                  }
                />
                <Route
                  path="site/:siteNavId" // Matches /site/ZoneA-Site1
                  element={<SiteDetailPageRouteElement />} // Wrapper to get data from location state
                />
              </Routes>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component to extract siteData from location state for SiteDetailPage
function SiteDetailPageRouteElement() {
  const location = useLocation();
  const { siteNavId } = useParams(); // Get siteNavId from URL if needed for fetching
  const siteDataFromState = location.state?.siteData;

  // In a real app, if siteDataFromState is not available,
  // you might fetch data using siteNavId here.
  // For this example, we rely on it being passed via navigation state.

  if (!siteDataFromState) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300">
          Error
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Site data not found for ID: {siteNavId}. Please navigate from a valid
          source.
        </p>
      </div>
    );
  }

  return (
    <SiteDetailPage
      siteData={siteDataFromState}
      initialTheme={
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      }
    />
  );
}
