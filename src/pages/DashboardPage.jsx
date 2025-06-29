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
import { ArrowUp, ArrowDown, XCircle } from "lucide-react";
import NetworkVisualizerWrapper from "../components/NetworkVisualizerWrapper";
import NetworkVisualizer5Wrapper from "../components/NetworkVisualizer5Wrapper";
import CoreSitePage from "../components/CoreSite/CoreSitePage";
import SiteDetailPage from "../components/end-site/SiteDetailPage";
import EndSiteIndexPage from "../components/end-site/EndSiteIndexPage";
import {
  FullscreenIcon,
  ExitFullscreenIcon,
} from "../components/layout/AppLayout"; // Adjusted path
import LinkTable from "../components/CoreDevice/LinkTable";
import FavoritesPage from "./FavoritesPage";
import AllInterfacesPage from "./AllInterfacesPage";
import { useRelatedDevices } from "./useRelatedDevices";
import { selectAllDevices } from "../redux/slices/devicesSlice";
import { selectAllSites } from "../redux/slices/sitesSlice";
import { selectAllTenGigLinks } from "../redux/slices/tenGigLinksSlice";

// This helper component is for the "All Interfaces" and "Favorites" tabs
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

// This component remains unchanged and is used for nested routing within the charts.
function NodeDetailView({ chartType }) {
  const { nodeId: deviceHostname, zoneId } = useParams();
  const allDevices = useSelector(selectAllDevices);
  const allSites = useSelector(selectAllSites);
  const allLinks = useSelector(selectAllTenGigLinks);
  const otherDevicesInZone = useRelatedDevices(deviceHostname, zoneId);

  const linksForTable = React.useMemo(() => {
    if (
      !deviceHostname ||
      !chartType ||
      !allDevices.length ||
      !allLinks.length
    ) {
      return [];
    }
    const typeId = chartType === "P" ? 2 : 1;
    const allCoreLinksForChart = allLinks.filter(
      (link) => link.network_type_id === typeId
    );
    const currentDevice = allDevices.find((d) => d.hostname === deviceHostname);
    if (!currentDevice) return [];

    const deviceMapByHostname = new Map(allDevices.map((d) => [d.hostname, d]));

    const interCoreLinks = allCoreLinksForChart
      .filter(
        (link) =>
          link.source === deviceHostname || link.target === deviceHostname
      )
      .map((link) => {
        const otherDeviceHostname =
          link.source === deviceHostname ? link.target : link.source;
        const otherDevice = deviceMapByHostname.get(otherDeviceHostname);
        let linkType = "inter-core-different-site";
        if (
          otherDevice &&
          otherDevice.core_pikudim_site_id ===
            currentDevice.core_pikudim_site_id
        ) {
          linkType = "inter-core-same-site";
        }
        return {
          id: link.id,
          name: `Link to ${otherDeviceHostname}`,
          description: `Inter-Core Link (${
            linkType.includes("same") ? "Same Site" : "Different Site"
          })`,
          status: link.status,
          bandwidth: link.bandwidth,
          ospfStatus: "Enabled",
          mplsStatus: "Enabled",
          type: linkType,
        };
      });

    const coreToSiteLinks = allSites
      .filter((site) => site.device_id === currentDevice.id)
      .map((site) => ({
        id: `site-link-${site.id}`,
        name: site.site_name_english,
        description: "Connection to End-Site",
        status: "up",
        bandwidth: "1 Gbps",
        ospfStatus: "N/A",
        mplsStatus: "N/A",
        type: "core-to-site",
        additionalDetails: {
          mediaType: "Ethernet/Fiber",
          containerName: site.site_name_hebrew,
        },
      }));

    return [...interCoreLinks, ...coreToSiteLinks];
  }, [deviceHostname, chartType, allDevices, allSites, allLinks]);

  const currentTheme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

  return (
    <div className="p-1">
      <LinkTable
        coreDeviceName={deviceHostname}
        coreSiteName={zoneId}
        linksData={linksForTable}
        otherDevicesInZone={otherDevicesInZone}
        initialTheme={currentTheme}
      />
    </div>
  );
}

/**
 * The DashboardPage is now a container for the different tab contents.
 * It no longer manages tab state itself but receives it via props from AppLayout.
 * Its primary responsibility is to use React Router to display the correct content
 * for the active URL path (e.g., /favorites, /l-chart, etc.).
 */
export function DashboardPage({
  // Props related to fullscreen and layout
  isAppFullscreen,
  toggleAppFullscreen,
  isFullscreenActive,
  enterFullscreenButtonClasses,
  exitFullscreenButtonClasses,
  // Props that were "lifted up" from useDashboardLogic to AppLayout
  activeTabValue,
  theme,
  popupAnchorCoords,
  chartKeySuffix,
}) {
  const location = useLocation();

  // This function remains here as it's specific to the chart views within the dashboard
  const renderFullscreenToggleButton = () => {
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

  // These helpers are still useful for styling the content cards based on fullscreen state
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
    // The main container for the dashboard content area.
    // NOTE: The <Tabs> wrapper and <TabsList> have been removed from this file.
    <div
      className={`flex flex-col h-full ${
        isAppFullscreen
          ? "bg-white dark:bg-gray-800"
          : "bg-white dark:bg-gray-800 rounded-lg shadow-md"
      }`}
    >
      <Routes>
        <Route
          path="/favorites"
          element={
            <Card className={getCardClassName("favorites")}>
              <CardContent className={getCardContentClassName("favorites")}>
                <FavoritesPage />
              </CardContent>
            </Card>
          }
        />
        <Route
          path="/all_interfaces"
          element={
            <Card className={getCardClassName("all_interfaces")}>
              <CardContent
                className={getCardContentClassName("all_interfaces")}
              >
                <AllInterfacesPage />
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
                    <Route index element={<EndSiteIndexPage />} />
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
        {/* Default routes to redirect to favorites */}
        <Route path="/" element={<Navigate to="/favorites" replace />} />
        <Route path="*" element={<Navigate to="/favorites" replace />} />
      </Routes>
    </div>
  );
}

// This helper component for the sites route remains unchanged.
function SiteDetailPageRouteElement() {
  const location = useLocation();
  const siteGroupFromState = location.state?.siteGroupData;

  return siteGroupFromState ? (
    <SiteDetailPage
      siteGroup={siteGroupFromState}
      initialTheme={
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      }
    />
  ) : (
    <Navigate to="/sites" replace />
  );
}
