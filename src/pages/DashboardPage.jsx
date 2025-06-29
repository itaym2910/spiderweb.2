import React from "react";
import { useSelector } from "react-redux";
import {
  Routes,
  Route,
  useParams,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ArrowUp, ArrowDown, XCircle } from "lucide-react";

// Page Components for each tab
import FavoritesPage from "./FavoritesPage";
import AllInterfacesPage from "./AllInterfacesPage";

// Chart and Site specific components
import NetworkVisualizerWrapper from "../components/NetworkVisualizerWrapper";
import NetworkVisualizer5Wrapper from "../components/NetworkVisualizer5Wrapper";
import CoreSitePage from "../components/CoreSite/CoreSitePage";
import SiteDetailPage from "../components/end-site/SiteDetailPage";
import EndSiteIndexPage from "../components/end-site/EndSiteIndexPage";
import LinkTable from "../components/CoreDevice/LinkTable";

// Helper hooks and Redux selectors
import { useRelatedDevices } from "./useRelatedDevices";
import { selectAllDevices } from "../redux/slices/devicesSlice";
import { selectAllSites } from "../redux/slices/sitesSlice";
import { selectAllTenGigLinks } from "../redux/slices/tenGigLinksSlice";

// This helper component can be used by other pages like FavoritesPage
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

// This component is used for nested routing within the charts.
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

export function DashboardPage({
  isAppFullscreen,
  theme,
  popupAnchorCoords,
  chartKeySuffix,
}) {
  return (
    <Routes>
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/all_interfaces" element={<AllInterfacesPage />} />

      <Route
        path="/l-chart/*"
        element={
          <div
            className={`relative w-full h-full ${
              !isAppFullscreen && "rounded-lg shadow-sm"
            } overflow-hidden bg-white dark:bg-gray-900`}
          >
            <Routes>
              <Route
                index
                element={
                  <NetworkVisualizerWrapper
                    // The theme is added to the key to force a remount on theme change.
                    key={`l-visualizer-${chartKeySuffix}-${theme}`}
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
        }
      />

      <Route
        path="/p-chart/*"
        element={
          <div
            className={`relative w-full h-full ${
              !isAppFullscreen && "rounded-lg shadow-sm"
            } overflow-hidden bg-white dark:bg-gray-900`}
          >
            <Routes>
              <Route
                index
                element={
                  <NetworkVisualizer5Wrapper
                    // The theme is added to the key to force a remount on theme change.
                    key={`p-visualizer-${chartKeySuffix}-${theme}`}
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
        }
      />

      <Route
        path="/sites/*"
        element={
          <div className="w-full h-full">
            <Routes>
              <Route index element={<EndSiteIndexPage />} />
              <Route
                path="site/:siteNavId"
                element={<SiteDetailPageRouteElement />}
              />
            </Routes>
          </div>
        }
      />

      {/* Default routes to redirect to the favorites tab */}
      <Route path="/" element={<Navigate to="/favorites" replace />} />
      <Route path="*" element={<Navigate to="/favorites" replace />} />
    </Routes>
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
