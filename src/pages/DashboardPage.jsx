import React from "react";
import { useSelector } from "react-redux";
import {
  Routes,
  Route,
  useParams,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Star, ArrowUp, ArrowDown, XCircle } from "lucide-react";
import NetworkVisualizerWrapper from "../components/NetworkVisualizerWrapper";
import NetworkVisualizer5Wrapper from "../components/NetworkVisualizer5Wrapper";
import CoreSitePage from "../components/CoreSite/CoreSitePage";
import SiteDetailPage from "../components/end-site/SiteDetailPage";
import { FullscreenIcon, ExitFullscreenIcon } from "../App";
import { useDashboardLogic } from "./useDashboardLogic";
import LinkTable from "../components/CoreDevice/LinkTable";
import { useInterfaceData } from "./useInterfaceData";
import { useRelatedDevices } from "./useRelatedDevices";
import { useLinkTableData } from "./useLinkTableData";

// This helper component is for the new "All Interfaces" and "Favorites" tabs
function StatusIndicator({ status }) {
  const statusConfig = {
    Up: { color: "text-green-500", Icon: ArrowUp, label: "Up" },
    Down: { color: "text-red-500", Icon: ArrowDown, label: "Down" },
    "Admin Down": {
      color: "text-gray-500",
      Icon: XCircle,
      label: "Admin Down",
    },
  };
  const config = statusConfig[status] || statusConfig["Admin Down"];
  return (
    <div className={`flex items-center gap-2 font-medium ${config.color}`}>
      <config.Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
}

function NodeDetailView({ chartType }) {
  const { nodeId, zoneId } = useParams();

  const otherDevices = useRelatedDevices(nodeId, zoneId);
  // Pass the chartType prop to the hook
  const linksForTable = useLinkTableData(chartType);

  const currentTheme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

  return (
    <div className="p-1">
      <LinkTable
        coreDeviceName={nodeId}
        coreSiteName={zoneId}
        linksData={linksForTable}
        otherDevicesInZone={otherDevices}
        initialTheme={currentTheme}
      />
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
    popupAnchorCoords,
    handleTabChangeForNavigation,
    chartKeySuffix,
  } = useDashboardLogic({
    isAppFullscreen,
    isSidebarCollapsed,
  });

  // Use useSelector to get the data from the Redux state
  // eslint-disable-next-line no-unused-vars
  const allPikudim = useSelector((state) => state.corePikudim.items);
  // eslint-disable-next-line no-unused-vars
  const allDevices = useSelector((state) => state.devices.items);

  // --- NEW: Use the custom hook to get interface data and logic ---
  const { interfaces, handleToggleFavorite } = useInterfaceData();
  const favoriteInterfaces = interfaces.filter((iface) => iface.isFavorite);

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

  const getCardClassName = (tabKey) =>
    `flex-1 flex flex-col min-h-0 ${
      isAppFullscreen && activeTabValue === tabKey
        ? "border-0 rounded-none shadow-none"
        : "border dark:border-gray-700"
    }`;

  const getCardContentClassName = (tabKey) =>
    `flex-1 overflow-auto ${
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
        isAppFullscreen
          ? "bg-white dark:bg-gray-800"
          : "bg-white dark:bg-gray-800 rounded-lg shadow-md"
      } ${isAppFullscreen ? "p-0" : ""}`}
    >
      <Tabs
        value={activeTabValue}
        defaultValue="favorites"
        className="w-full flex flex-col flex-1"
        onValueChange={handleTabChangeForNavigation}
      >
        <TabsList
          className={`bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4 ${
            isAppFullscreen ? "mx-0 mt-0 rounded-none sticky top-0 z-40" : ""
          }`}
        >
          {/* --- REPLACED: "mainlines" tab with "favorites" --- */}
          <TabsTrigger value="favorites" className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" /> Favorites
          </TabsTrigger>
          <TabsTrigger value="all_interfaces">All Interfaces</TabsTrigger>
          <TabsTrigger value="l_network">L-chart</TabsTrigger>
          <TabsTrigger value="p_network">P-chart</TabsTrigger>
          <TabsTrigger value="site">Site</TabsTrigger>
        </TabsList>

        <div className="flex-1 flex flex-col min-h-0">
          <Routes>
            {/* --- REPLACED: /mainlines route with /favorites route --- */}
            <Route
              path="/favorites"
              element={
                <Card className={getCardClassName("favorites")}>
                  <CardContent className={getCardContentClassName("favorites")}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Interface</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {favoriteInterfaces.length > 0 ? (
                          favoriteInterfaces.map((iface) => (
                            <TableRow key={iface.id}>
                              <TableCell>
                                <div className="font-medium">
                                  {iface.interfaceName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {iface.description}
                                </div>
                              </TableCell>
                              <TableCell>{iface.deviceName}</TableCell>
                              <TableCell>
                                <StatusIndicator status={iface.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleFavorite(iface.id)}
                                >
                                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              No favorite interfaces selected.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              }
            />
            {/* --- NEW: /all_interfaces route --- */}
            <Route
              path="/all_interfaces"
              element={
                <Card className={getCardClassName("all_interfaces")}>
                  <CardContent
                    className={getCardContentClassName("all_interfaces")}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Interface</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Traffic (In / Out)</TableHead>
                          <TableHead>Errors (In / Out)</TableHead>
                          <TableHead className="text-right">Favorite</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {interfaces.map((iface) => (
                          <TableRow key={iface.id}>
                            <TableCell>
                              <div className="font-medium">
                                {iface.interfaceName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {iface.description}
                              </div>
                            </TableCell>
                            <TableCell>{iface.deviceName}</TableCell>
                            <TableCell>
                              <StatusIndicator status={iface.status} />
                            </TableCell>
                            <TableCell>{`${iface.trafficIn} / ${iface.trafficOut}`}</TableCell>
                            <TableCell
                              className={
                                iface.errors.in > 0 || iface.errors.out > 0
                                  ? "font-bold text-orange-600 dark:text-orange-400"
                                  : ""
                              }
                            >
                              {`${iface.errors.in} / ${iface.errors.out}`}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleFavorite(iface.id)}
                              >
                                <Star
                                  className={`h-5 w-5 transition-colors ${
                                    iface.isFavorite
                                      ? "text-yellow-500 fill-yellow-400"
                                      : "text-gray-400 hover:text-yellow-500"
                                  }`}
                                />
                              </Button>
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
                    <div className="relative w-full h-full">
                      <Routes>
                        <Route
                          index
                          element={
                            <NetworkVisualizerWrapper
                              key={`l-visualizer-${chartKeySuffix}`}
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
                    <div className="relative w-full h-full">
                      <Routes>
                        <Route
                          index
                          element={
                            <NetworkVisualizer5Wrapper
                              key={`p-visualizer-${chartKeySuffix}`}
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
                    <div className="relative w-full h-full">
                      <Routes>
                        <Route
                          index
                          element={
                            <div className="p-6">
                              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                Site Information
                              </h2>
                              <p className="text-gray-700 dark:text-gray-300">
                                Select a site to view details.
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

            <Route path="/" element={<Navigate to="/favorites" replace />} />
            <Route path="*" element={<Navigate to="/favorites" replace />} />
          </Routes>
        </div>
      </Tabs>
    </div>
  );
}

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
