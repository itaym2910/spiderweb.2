// src/DashboardPage.js
import React from "react";
import {
  Routes,
  Route,
  useParams,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Card, CardContent } from "./components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "./components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import NetworkVisualizerWrapper from "./components/NetworkVisualizerWrapper";
import NetworkVisualizer5Wrapper from "./components/NetworkVisualizer5Wrapper";
import CoreSitePage from "./components/CoreSite/CoreSitePage";
import SiteDetailPage from "./components/end-site/SiteDetailPage";
import { data as mainLinesTableData } from "./dataMainLines";
import { FullscreenIcon, ExitFullscreenIcon } from "./App";
import { useDashboardLogic } from "./useDashboardLogic";
import LinkTable from "./components/CoreDevice/LinkTable";
import { sampleLinks } from "./components/CoreDevice/sampleLinkData";

// NodeDetailView remains the same
// eslint-disable-next-line no-unused-vars
function NodeDetailView({ chartType }) {
  const { nodeId } = useParams();
  const linksToDisplayInTable = sampleLinks;
  return (
    <div className="p-1">
      <LinkTable coreDeviceName={nodeId} linksData={linksToDisplayInTable} />
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
    // tabContentCardRef, // May not be needed if Cards are directly in Route elements
    popupAnchorCoords,
    handleTabChangeForNavigation,
    chartKeySuffix,
  } = useDashboardLogic({
    isAppFullscreen,
    isSidebarCollapsed,
  });
  const location = useLocation();

  const renderFullscreenToggleButton = () => {
    // ... (logic remains the same)
    const isLChartBase = location.pathname === "/l-chart";
    const isPChartBase = location.pathname === "/p-chart";
    const isBaseNetworkView = isLChartBase || isPChartBase;

    if (!toggleAppFullscreen || !isBaseNetworkView) return null;

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

  const getCardClassName = (
    tabKey // Using tabKey to be more generic if needed
  ) =>
    `flex-1 flex flex-col min-h-0 ${
      // Ensure Card itself can grow and has min-height
      isAppFullscreen && activeTabValue === tabKey // Compare with activeTabValue from hook
        ? "border-0 rounded-none shadow-none"
        : "border dark:border-gray-700"
    }`;

  const getCardContentClassName = (tabKey) =>
    `flex-1 overflow-auto ${
      // Ensure CardContent can grow and scroll
      isAppFullscreen && activeTabValue === tabKey
        ? tabKey === "l_network" || tabKey === "p_network" || tabKey === "site"
          ? "p-0"
          : "p-4"
        : tabKey === "l_network" || tabKey === "p_network" || tabKey === "site"
        ? "p-0"
        : "p-4"
    } relative`;

  return (
    <div
      className={`flex flex-col h-full ${
        // Main container is flex-col and takes full height
        isAppFullscreen
          ? "bg-white dark:bg-gray-800"
          : "bg-white dark:bg-gray-800 rounded-lg shadow-md"
      } ${isAppFullscreen ? "p-0" : ""}`}
    >
      <Tabs // The <Tabs> component itself is NOT a flex item that grows here
        value={activeTabValue}
        defaultValue="table"
        className="w-full flex flex-col flex-1" // <<< MAKE SURE TABS ITSELF IS FLEX AND CAN GROW
        onValueChange={handleTabChangeForNavigation}
      >
        <TabsList // TabsList is just a direct child, its size is content-based
          className={`bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4 ${
            isAppFullscreen ? "mx-0 mt-0 rounded-none sticky top-0 z-40" : ""
          }`}
        >
          <TabsTrigger value="table">Main Lines</TabsTrigger>
          <TabsTrigger value="l_network">L-chart</TabsTrigger>
          <TabsTrigger value="p_network">P-chart</TabsTrigger>
          <TabsTrigger value="site">Site</TabsTrigger>
        </TabsList>

        {/* This div will contain the routed content and MUST grow to fill space */}
        <div className="flex-1 flex flex-col min-h-0">
          {" "}
          {/* <<< KEY CHANGE HERE */}
          <Routes>
            <Route
              path="/mainlines"
              element={
                // Card and CardContent should also be set up to fill their parent if needed
                <Card className={getCardClassName("table")}>
                  <CardContent className={getCardContentClassName("table")}>
                    <Table>
                      {/* ... Table content ... */}
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
                        {mainLinesTableData.map((item, i) => (
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
              }
            />

            <Route
              path="/l-chart/*"
              element={
                <Card className={getCardClassName("l_network")}>
                  <CardContent className={getCardContentClassName("l_network")}>
                    {location.pathname === "/l-chart" &&
                      renderFullscreenToggleButton()}
                    {/* This inner div needs to ensure the visualizer takes full space of CardContent */}
                    <div className="relative w-full h-full">
                      {" "}
                      {/* <<< ENSURE THIS IS FULL HEIGHT/WIDTH */}
                      <Routes>
                        <Route
                          index
                          element={
                            <NetworkVisualizerWrapper
                              key={`l-visualizer-${chartKeySuffix}`}
                              data={mainLinesTableData}
                              theme={theme}
                            />
                          }
                        />
                        <Route
                          path="zone/:zoneId"
                          element={
                            <CoreSitePage
                              theme={theme}
                              popupAnchor={popupAnchorCoords}
                              chartType="L"
                            />
                          }
                        />
                        <Route
                          path="zone/:zoneId/node/:nodeId"
                          element={<NodeDetailView chartType="L" />}
                        />
                      </Routes>
                    </div>
                  </CardContent>
                </Card>
              }
            />

            <Route
              path="/p-chart/*"
              element={
                <Card className={getCardClassName("p_network")}>
                  <CardContent className={getCardContentClassName("p_network")}>
                    {location.pathname === "/p-chart" &&
                      renderFullscreenToggleButton()}
                    {/* This inner div needs to ensure the visualizer takes full space of CardContent */}
                    <div className="relative w-full h-full">
                      {" "}
                      {/* <<< ENSURE THIS IS FULL HEIGHT/WIDTH */}
                      <Routes>
                        <Route
                          index
                          element={
                            <NetworkVisualizer5Wrapper
                              key={`p-visualizer-${chartKeySuffix}`}
                              data={mainLinesTableData}
                              theme={theme}
                            />
                          }
                        />
                        <Route
                          path="zone/:zoneId"
                          element={
                            <CoreSitePage
                              theme={theme}
                              popupAnchor={popupAnchorCoords}
                              chartType="P"
                            />
                          }
                        />
                        <Route
                          path="zone/:zoneId/node/:nodeId"
                          element={<NodeDetailView chartType="P" />}
                        />
                      </Routes>
                    </div>
                  </CardContent>
                </Card>
              }
            />

            <Route
              path="/sites/*"
              element={
                <Card className={getCardClassName("site")}>
                  <CardContent className={getCardContentClassName("site")}>
                    {/* This inner div needs to ensure the content takes full space of CardContent */}
                    <div className="relative w-full h-full">
                      {" "}
                      {/* <<< ENSURE THIS IS FULL HEIGHT/WIDTH */}
                      <Routes>
                        <Route
                          index
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
                          path="site/:siteNavId"
                          element={<SiteDetailPageRouteElement />}
                        />
                      </Routes>
                    </div>
                  </CardContent>
                </Card>
              }
            />

            <Route path="/" element={<Navigate to="/mainlines" replace />} />
            <Route path="*" element={<Navigate to="/mainlines" replace />} />
          </Routes>
        </div>
      </Tabs>{" "}
      {/* Moved the closing tag for Tabs here to wrap the content div */}
    </div>
  );
}

// SiteDetailPageRouteElement helper component remains the same
function SiteDetailPageRouteElement() {
  const location = useLocation();
  const { siteNavId } = useParams();
  const siteDataFromState = location.state?.siteData;

  if (!siteDataFromState) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300">
          Error
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Site data not found for ID: {siteNavId}. Please navigate from a valid
          source or implement direct loading.
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
