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
import FavoritesPage from "./dashboard/FavoritesPage";
import AllInterfacesPage from "./dashboard/AllInterfacesPage";

// Chart and Site specific components
import NetworkVisualizerWrapper from "./dashboard/NetworkVisualizerWrapper";
import NetworkVisualizer5Wrapper from "./dashboard/NetworkVisualizer5Wrapper";
import CoreSitePage from "../components/CoreSite/CoreSitePage";
import LinkTable from "../components/CoreDevice/LinkTable";

// Helper hooks and Redux selectors
import { useRelatedDevices } from "../hooks/useRelatedDevices";
import { selectAllDevices, selectDeviceInfo } from "../redux/slices/devicesSlice";
import { selectAllSites } from "../redux/slices/sitesSlice";
import { selectAllTenGigLinks } from "../redux/slices/tenGigLinksSlice";
import { api } from "../services/apiServices";

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

// This component now correctly receives the theme prop to pass down.
function NodeDetailView({ chartType, theme }) {
  const { nodeId: deviceHostname, zoneId } = useParams();
  const allDevices = useSelector(selectAllDevices);
  const allSites = useSelector(selectAllSites);
  const deviceInfo = useSelector(selectDeviceInfo);
  const otherDevicesInZone = useRelatedDevices(deviceHostname, zoneId);

  const [apiDeviceLinks, setApiDeviceLinks] = React.useState([]);

  // Find the current device object and its interfaces
  const currentDevice = React.useMemo(() => {
    return allDevices.find((d) => 
      d.hostname === deviceHostname || 
      d.name === deviceHostname || 
      String(d.id) === String(deviceHostname)
    ) || null;
  }, [allDevices, deviceHostname]);

  React.useEffect(() => {
    if (currentDevice?.id) {
      api.getLinksTopologyByDevice(currentDevice.id)
        .then((data) => {
          setApiDeviceLinks(Array.isArray(data) ? data : data.links || []);
        })
        .catch((err) => console.error("Failed to fetch device links:", err));
    }
  }, [currentDevice?.id]);

  const deviceInterfaces = React.useMemo(() => {
    if (!currentDevice) return [];

    // 1. Map API topology links to interfaces format
    if (apiDeviceLinks && apiDeviceLinks.length > 0) {
      return apiDeviceLinks.map((link) => {
        const remoteName = link.neighbor_coredevice?.name || link.neighbor_site?.name || link.target || "Unknown Device";
        const operStatus = String(link.oper_status || link.status || link.physicalStatus || "down").toLowerCase() === "up" ? "Up" : "Down";
        const ospfStatus = String(link.ospf_state || link.ospfStatus || link.protocolStatus || "down").toLowerCase() === "full" ? "Up" : "Down";
        
        return {
          id: link.id || Math.random().toString(),
          name: link.local_interface || link.name || "Unknown Interface",
          description: link.description || `Link to ${typeof remoteName === "object" ? remoteName.name || remoteName.hostname : remoteName}`,
          physical_status: operStatus,
          protocol_status: ospfStatus,
          bandwidth: link.bandwidth || link.bw || 10000,
          mtu: link.mtu || 9000,
          media_type: link.media_type || link.MediaType || "Fiber Optic",
          cdp: typeof remoteName === "object" ? remoteName.name || remoteName.hostname : remoteName,
          ospf: ospfStatus,
          mpls: link.mpls || "Enabled",
          tx: link.tx !== undefined ? link.tx : (link.tx_power !== undefined ? link.tx_power : (link.TX !== undefined ? link.TX : "N/A")),
          rx: link.rx !== undefined ? link.rx : (link.rx_power !== undefined ? link.rx_power : (link.RX !== undefined ? link.RX : "N/A")),
          crc: link.crc || 0,
        };
      });
    }

    // 2. Try finding in deviceInfo store by id (number or string) or hostname
    if (deviceInfo) {
      const found =
        deviceInfo[currentDevice.id] ||
        deviceInfo[String(currentDevice.id)] ||
        deviceInfo[currentDevice.hostname];
      if (Array.isArray(found) && found.length > 0) {
        return found;
      }
    }

    return [];
  }, [currentDevice, deviceInfo, apiDeviceLinks]);

  const linksForTable = React.useMemo(() => {
    if (!currentDevice) return [];

    const deviceMapByHostname = new Map(allDevices.map((d) => [d.hostname, d]));
    const deviceMapById = new Map(allDevices.map((d) => [d.id, d]));
    const typeId = chartType === "P" ? 2 : 1;

    // Helper to get hostname string from string, number, or node object
    const getHostname = (val, linkObj, isSource) => {
      if (val && typeof val === "object") return val.hostname || val.name || "";
      if (val && typeof val === "string") return val;
      if (val) return String(val);
      
      // Fallback to coredevice/neighbor_coredevice structure if val is undefined
      if (linkObj) {
        if (isSource && linkObj.coredevice) return linkObj.coredevice.name || linkObj.coredevice.hostname || "";
        if (!isSource && linkObj.neighbor_coredevice) return linkObj.neighbor_coredevice.name || linkObj.neighbor_coredevice.hostname || "";
        if (!isSource && linkObj.neighbor_site) return linkObj.neighbor_site.name || "";
      }
      return "";
    };

    const interCoreLinks = apiDeviceLinks
      .filter((link) => {
        // Match network type if present
        const linkTypeId = link.network_type_id ?? link.type_id;
        if (
          linkTypeId !== undefined &&
          linkTypeId !== null &&
          Number(linkTypeId) !== typeId
        ) {
          return false;
        }

        const sourceHost = getHostname(link.source, link, true);
        const targetHost = getHostname(link.target, link, false);

        const isSource =
          sourceHost === deviceHostname ||
          link.coredevice_id === currentDevice.id ||
          link.source === currentDevice.id ||
          link.coredevice?.id === currentDevice.id;

        const isTarget =
          targetHost === deviceHostname ||
          link.neighbor_coredevice_id === currentDevice.id ||
          link.target === currentDevice.id ||
          link.neighbor_coredevice?.id === currentDevice.id ||
          link.neighbor_site?.id === currentDevice.id;

        return isSource || isTarget || true; // Since the API only returns links for this device, we can just return true.
      })
      .map((link) => {
        const sourceHost = getHostname(link.source, link, true);
        const targetHost = getHostname(link.target, link, false);

        const isSource =
          sourceHost === deviceHostname ||
          link.coredevice_id === currentDevice.id ||
          link.source === currentDevice.id ||
          link.coredevice?.id === currentDevice.id;

        const otherDeviceHostname = isSource ? targetHost : sourceHost;
        const otherDeviceId = isSource
          ? link.neighbor_coredevice_id || link.target || link.neighbor_coredevice?.id || link.neighbor_site?.id
          : link.coredevice_id || link.source || link.coredevice?.id;

        const otherDevice =
          deviceMapByHostname.get(otherDeviceHostname) ||
          (typeof otherDeviceId === "object"
            ? otherDeviceId
            : deviceMapById.get(otherDeviceId));

        const finalOtherHost =
          otherDevice?.hostname ||
          (typeof otherDeviceHostname === "string" && otherDeviceHostname
            ? otherDeviceHostname
            : `Device-${otherDeviceId || "Unknown"}`);

        let linkType = "inter-core-different-site";
        if (!link.neighbor_coredevice) {
          linkType = "core-to-site";
        } else if (
          link.coredevice &&
          link.coredevice.coresite_id === link.neighbor_coredevice.coresite_id
        ) {
          linkType = "inter-core-same-site";
        } else {
          linkType = "inter-core-different-site";
        }

        const rawStatus = (
          link.oper_status ||
          link.status ||
          link.physicalStatus ||
          "up"
        ).toLowerCase();
        
        const ospfStatus = (link.ospf_state || link.ospfStatus || "full").toLowerCase();

        let normalizedStatus = "up";
        if (rawStatus === "down") {
          normalizedStatus = "down";
        } else if (rawStatus === "issue" || ospfStatus !== "full") {
          normalizedStatus = "issue";
        }

        const bw = link.bandwidth || link.Bandwidth || link.bw;
        const formattedBw =
          typeof bw === "number"
            ? bw >= 1000
              ? `${bw / 1000} Gbps`
              : `${bw} Mbps`
            : bw || "10 Gbps";

        return {
          id: link.id || `link-${Math.random()}`,
          name: `Link to ${finalOtherHost}`,
          description: `Inter-Core Link (${
            linkType.includes("same") ? "Same Site" : "Different Site"
          })`,
          status: normalizedStatus,
          bandwidth: formattedBw,
          ospfStatus: link.OSPF || link.ospfStatus || "Enabled",
          mplsStatus: link.MPLS || link.mplsStatus || "Enabled",
          type: linkType,
          additionalDetails: {
            mediaType: link.MediaType || link.media_type || "Fiber",
            cdpNeighbors: link.CDP || link.cdp || finalOtherHost,
            containerName: link.containerName || "Core Backbone",
            mtu: link.mtu || 9000,
            crcErrors: link.crc ?? link.crcErrors ?? 0,
            inputDataRate: link.input_data
              ? `${link.input_data} Mbps`
              : link.input_rate || "N/A",
            outputDataRate: link.output_data
              ? `${link.output_data} Mbps`
              : link.output_rate || "N/A",
            txPower: link.tx !== undefined ? `${link.tx} dBm` : (link.TX ? `${link.TX} dBm` : link.txPower || "N/A"),
            rxPower: link.rx !== undefined ? `${link.rx} dBm` : (link.RX ? `${link.RX} dBm` : link.rxPower || "N/A"),
          },
        };
      });

      return interCoreLinks;
  }, [
    deviceHostname,
    chartType,
    allDevices,
    allSites,
    apiDeviceLinks,
    currentDevice,
  ]);

  return (
    <div className="w-full h-full overflow-hidden flex flex-col min-h-0 p-2 sm:p-3">
      <LinkTable
        coreDeviceName={deviceHostname}
        coreSiteName={zoneId}
        linksData={linksForTable}
        otherDevicesInZone={otherDevicesInZone}
        theme={theme}
        chartType={chartType}
        interfaces={deviceInterfaces}
        currentDevice={currentDevice}
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

      {/* THE FIX: The chart routes are restructured to separate layouts for each sub-route. */}
      <Route
        path="/l-chart/*"
        element={
          <Routes>
            {/* The index route gets the non-scrolling, fixed-height layout */}
            <Route
              index
              element={
                <div
                  className={`relative w-full h-full ${
                    !isAppFullscreen && "rounded-lg shadow-sm"
                  } overflow-hidden bg-white dark:bg-gray-900`}
                >
                  <NetworkVisualizerWrapper
                    key={`l-visualizer-${chartKeySuffix}-${theme}`}
                    theme={theme}
                  />
                </div>
              }
            />
            {/* The node route is rendered directly, allowing it to use the main scrollbar */}
            <Route
              path="zone/:zoneId/node/:nodeId"
              element={<NodeDetailView chartType="L" theme={theme} />}
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
          </Routes>
        }
      />

      <Route
        path="/p-chart/*"
        element={
          <Routes>
            {/* The index route gets its own non-scrolling, fixed-height layout */}
            <Route
              index
              element={
                <div
                  className={`relative w-full h-full ${
                    !isAppFullscreen && "rounded-lg shadow-sm"
                  } overflow-hidden bg-white dark:bg-gray-900`}
                >
                  <NetworkVisualizer5Wrapper
                    key={`p-visualizer-${chartKeySuffix}-${theme}`}
                    theme={theme}
                  />
                </div>
              }
            />
            {/* The node route is rendered directly, allowing it to use the main scrollbar */}
            <Route
              path="zone/:zoneId/node/:nodeId"
              element={<NodeDetailView chartType="P" theme={theme} />}
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
          </Routes>
        }
      />

      {/* Default routes to redirect to the favorites tab */}
      <Route path="/" element={<Navigate to="/favorites" replace />} />
      <Route path="*" element={<Navigate to="/favorites" replace />} />
    </Routes>
  );
}
