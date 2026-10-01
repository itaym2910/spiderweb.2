import React, { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import NetworkVisualizer5 from "../../components/chart/NetworkVisualizer5";
import LinkDetailPopup from "../../components/shared/LinkDetailPopup";
import NetworkLinksSideDrawer from "../../components/chart/NetworkLinksSideDrawer";
import ToggleDetailButton from "../../components/chart/ToggleDetailButton";
import { fetchInitialData } from "../../redux/slices/authSlice";
import { toggleFavoriteLink } from "../../redux/slices/favoritesSlice";
import {
  selectTopologyDevices,
  selectTopologyStatus,
  fetchCoreTopology,
} from "../../redux/slices/coreTopologySlice";
import { selectAllTrafficById } from "../../redux/slices/coreSiteTrafficSlice";
import { selectAllPikudim } from "../../redux/slices/corePikudimSlice";

// Import reusable feedback components
import { LoadingSpinner } from "../../components/ui/feedback/LoadingSpinner";
import { ErrorMessage } from "../../components/ui/feedback/ErrorMessage";

// Helper function to select top devices
function selectTopTwoDevices(devices) {
  if (devices.length <= 2) return devices;
  const priorityOrder = [4, 5, 1, 2, 7, 8];

  const getEnding = (name) => {
    if (!name) return NaN;
    // Extract the last sequence of digits in the string
    const match = name.match(/(\d+)(?!.*\d)/);
    return match ? parseInt(match[1], 10) : NaN;
  };

  const sortedDevices = [...devices].sort((a, b) => {
    const a_ending = getEnding(a.name);
    const b_ending = getEnding(b.name);

    const a_priority = priorityOrder.indexOf(a_ending);
    const b_priority = priorityOrder.indexOf(b_ending);

    const final_a_priority = a_priority === -1 ? 99 : a_priority;
    const final_b_priority = b_priority === -1 ? 99 : b_priority;

    return final_a_priority - final_b_priority;
  });
  return sortedDevices.slice(0, 2);
}

const NetworkVisualizer5Wrapper = ({ theme }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Poll core topology every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchCoreTopology());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Get topology data from the unified coreTopology slice
  const allTopologyDevices = useSelector(selectTopologyDevices);
  const topologyStatus = useSelector(selectTopologyStatus);
  const allTrafficById = useSelector(selectAllTrafficById);
  const allPikudim = useSelector(selectAllPikudim);

  const trafficByZone = useMemo(() => {
    const map = {};
    if (!allPikudim || !allTrafficById) return map;
    allPikudim.forEach((p) => {
      const traffic = allTrafficById[p.id] || allTrafficById[String(p.id)];
      if (traffic) {
        if (p.name) map[p.name] = traffic;
        if (p.core_site_name) map[p.core_site_name] = traffic;
      }
    });
    return map;
  }, [allPikudim, allTrafficById]);

  // Local UI state
  const [popupLink, setPopupLink] = useState(null);
  const [showDetailedLinks, setShowDetailedLinks] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [markedLinkIds, setMarkedLinkIds] = useState(new Set());
  const [hoveredLinkId, setHoveredLinkId] = useState(null);
  const [hoveredFilter, setHoveredFilter] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [pingSubFilter, setPingSubFilter] = useState("all");

  const handleOpenChange = useCallback((open) => {
    setIsDrawerOpen(open);
    if (!open) {
      setActiveFilter(null);
      setMarkedLinkIds(new Set());
    }
  }, []);

  const handleToggleMarkLink = (linkId) => {
    setMarkedLinkIds((prev) => {
      const next = new Set(prev);
      if (next.has(linkId)) {
        next.delete(linkId);
      } else {
        next.add(linkId);
      }
      return next;
    });
    // Sync the manually marked link with global favorites
    dispatch(toggleFavoriteLink(linkId));
  };

  const handleMarkAll = (linkIds) => {
    setMarkedLinkIds(new Set(linkIds));
  };

  const handleClearMarks = () => {
    setMarkedLinkIds(new Set());
  };

  // Build graph data from the core-topology endpoint
  const graphData = useMemo(() => {
    // Filter devices for this chart's network
    // P Chart: show devices with "anan_lekaman"/"anan-lekaman"/"p-network" network name,
    // plus the shared H-prefix devices (which have "ns" network name)
    const devicesForChart = allTopologyDevices.filter((d) => {
      if (!d.name) return false;
      const netName = (d.network_name || "").toLowerCase();
      const isPNetwork = netName.includes("anan-lekaman") || netName.includes("anan_lekaman") || netName.includes("p-network");
      const isSharedDevice = ["H1", "H2", "H4", "H5", "H7", "H8"].some((str) => d.name.includes(str));
      return isPNetwork || isSharedDevice;
    });

    if (devicesForChart.length === 0) {
      return { nodes: [], links: [] };
    }

    // Group devices by coresite_name (replaces pikudim lookup)
    const devicesBySite = devicesForChart.reduce((acc, device) => {
      const siteName = device.coresite_name || "Unknown";
      if (!acc[siteName]) {
        acc[siteName] = [];
      }
      acc[siteName].push(device);
      return acc;
    }, {});

    // Apply selectTopTwoDevices per zone group
    const topDevicesPerSite = Object.values(devicesBySite).flatMap(
      (deviceGroup) => selectTopTwoDevices(deviceGroup)
    );

    const visibleDeviceNames = new Set(topDevicesPerSite.map((d) => d.name));

    // Build a map of device id -> device for link resolution
    const allDevicesMapById = new Map(allTopologyDevices.map((d) => [d.id, d]));
    const deviceMapById = new Map(devicesForChart.map((d) => [d.id, d]));

    // Helper to get short name
    const getShortName = (name) => {
      if (!name) return name;

      // 1. Shared site logic (Original method)
      const isSharedSite = ["H1", "H2", "H4", "H5", "H7", "H8"].some((str) => name.includes(str));
      if (isSharedSite) {
        const matches = name.match(/[a-zA-Z]\d+/g);
        return matches ? matches[matches.length - 1].toUpperCase() : name;
      }

      // 2. Format: aa<number>_bbb_L<1, 2 or 3>-<1 or 2>-ccc -> L<1, 2 or 3>-<1 or 2>
      const lMatch = name.match(/L[123]-[12]/i);
      if (lMatch) {
        return lMatch[0].toUpperCase();
      }

      // 3. Format: xx_yy_zzz_aaaaa<number> -> yy zzz <number>
      const parts = name.split('_');
      if (parts.length === 4) {
        const lastPartMatch = parts[3].match(/\d+$/);
        if (lastPartMatch) {
          const num = lastPartMatch[0];
          return `${parts[1]} ${parts[2]} ${num}`;
        }
      }

      // Fallback
      return name;
    };

    // Build nodes
    const transformedNodes = topDevicesPerSite.map((device) => ({
      id: device.name,
      group: "node",
      name: device.name,
      shortName: getShortName(device.name),
      ip: device.ip,
      zone: device.coresite_name || "Unknown",
      pikudId: device.coresite_name || "Unknown",
      nodeType: "router",
      status: device.status || "up",
      device: device,
    }));

    // Extract and deduplicate links from devices
    const seenLinkIds = new Set();
    const linksBySignature = new Map();
    const endpointToSignature = new Map();

    devicesForChart.forEach((device) => {
      if (!device.links) return;

      device.links.forEach((link) => {
        // Skip duplicate records by ID
        if (seenLinkIds.has(link.id)) return;
        seenLinkIds.add(link.id);

        const remoteDevice = deviceMapById.get(link.remote_device_id) || allDevicesMapById.get(link.remote_device_id);
        const remoteDeviceName = link.remote_device_name || (remoteDevice ? remoteDevice.name : "Unknown");
        const remoteZone = (remoteDevice ? remoteDevice.coresite_name : null) || link.remote_coresite_name || "Unknown";

        // Normalize oper_status and ospf_state to up/down/issue
        const operStatus = (link.oper_status || "").toLowerCase();
        const ospfState = (link.ospf_state || "").toLowerCase();
        const isOspfFull = link.is_ospf_full !== undefined ? Boolean(link.is_ospf_full) : ospfState === "full";
        let normalized = "up";

        if (operStatus !== "up") {
          normalized = "down";
        } else if (!isOspfFull && (link.last_ospf_full_at !== "null" && link.last_ospf_full_at != null || link.is_ospf_full === false)) {
          normalized = "issue";
        }

        const isBothDevicesVisible = Boolean(
          visibleDeviceNames.has(device.name) &&
          remoteDevice &&
          visibleDeviceNames.has(remoteDevice.name)
        );

        // Determine link signature for bidirectional deduplication
        const localEp = `${device.name}::${link.local_interface || ""}`;
        const remoteEp = `${remoteDeviceName}::${link.remote_interface || ""}`;

        let signature = null;
        if (link.local_interface && endpointToSignature.has(localEp)) {
          signature = endpointToSignature.get(localEp);
        } else if (link.remote_interface && endpointToSignature.has(remoteEp)) {
          signature = endpointToSignature.get(remoteEp);
        }

        if (!signature) {
          if (link.local_interface || link.remote_interface) {
            signature = [localEp, remoteEp].sort().join("---");
          } else {
            signature = [device.name, remoteDeviceName, link.id].sort().join("---");
          }
        }

        if (linksBySignature.has(signature)) {
          const existing = linksBySignature.get(signature);
          if (!existing.allIds) existing.allIds = [existing.id];
          if (!existing.allIds.includes(link.id)) existing.allIds.push(link.id);

          // Elevate status if reciprocal side indicates down/issue
          if (normalized === "down") {
            existing.category = "down";
            existing.status = "down";
            existing.normalizedStatus = "down";
          } else if (normalized === "issue" && existing.category !== "down") {
            existing.category = "issue";
            existing.status = "issue";
            existing.normalizedStatus = "issue";
          }

          // If either side determines visibility, ensure it is marked visible
          if (isBothDevicesVisible) {
            existing.isVisibleOnMap = true;
          }

          // Fill any missing metadata from reciprocal link
          if (!existing.remote_device_name && (link.remote_device_name || remoteDeviceName)) {
            existing.remote_device_name = link.remote_device_name || remoteDeviceName;
          }
          if (!existing.remote_interface && link.local_interface) {
            existing.remote_interface = link.local_interface;
          }
          if (!existing.remote_link_ip && (link.local_link_ip || link.local_ip)) {
            existing.remote_link_ip = link.local_link_ip || link.local_ip;
          }
          if (!existing.remote_ip && (link.local_link_ip || link.local_ip)) {
            existing.remote_ip = link.local_link_ip || link.local_ip;
          }
          if (!existing.description && (link.local_interface_description || link.description)) {
            existing.description = link.local_interface_description || link.description;
            existing.local_interface_description = existing.description;
          }
          if (existing.ping_success_attempts === undefined && link.ping_success_attempts !== undefined) {
            existing.ping_success_attempts = link.ping_success_attempts;
          }
          if (existing.ping_success_rate === undefined && link.ping_success_rate !== undefined) {
            existing.ping_success_rate = link.ping_success_rate;
            existing.ping_packets_success = link.ping_packets_success ?? link.ping_success_attempts;
            existing.ping_packets_total = link.ping_packets_total;
            existing.ping_ratio = link.ping_ratio;
            existing.total_pings = link.total_pings ?? link.ping_total;
            existing.ping_total = link.ping_total ?? link.total_pings;
          }
          return;
        }

        const linkObj = {
          id: link.id,
          allIds: [link.id],
          source: device.name,
          target: remoteDeviceName,
          sourceName: device.name,
          targetName: remoteDeviceName,
          coredevice_id: device.id,
          neighbor_coredevice_id: link.remote_device_id,
          remote_device_id: link.remote_device_id,
          remote_device_name: link.remote_device_name || remoteDeviceName,
          sourceZone: device.coresite_name || "Unknown",
          targetZone: remoteZone,
          physical_status: link.oper_status,
          protocol_status: link.admin_status,
          oper_status: link.oper_status,
          admin_status: link.admin_status,
          description: link.local_interface_description || link.description || "",
          local_interface_description: link.local_interface_description || link.description || "",
          category: normalized,
          status: normalized,
          normalizedStatus: normalized,
          statusChangedAt: link.last_state_change_at,
          last_state_change_at: link.last_state_change_at,
          linkType: "core",
          bandwidth: link.bandwidth_mbps
            ? (typeof link.bandwidth_mbps === "number"
              ? (link.bandwidth_mbps >= 1000 ? `${link.bandwidth_mbps / 1000} Gbps` : `${link.bandwidth_mbps} Mbps`)
              : link.bandwidth_mbps)
            : "10G",
          bandwidth_mbps: link.bandwidth_mbps,
          mtu: link.mtu,
          ping_success_rate: link.ping_success_rate,
          ping_success_attempts: link.ping_success_attempts,
          ping_packets_success: link.ping_packets_success ?? link.ping_success_attempts,
          ping_packets_total: link.ping_packets_total,
          ping_ratio: link.ping_ratio,
          total_pings: link.total_pings ?? link.ping_total,
          ping_total: link.ping_total ?? link.total_pings,
          last_ping_at: link.last_ping_at,
          local_interface: link.local_interface,
          remote_interface: link.remote_interface,
          local_link_ip: link.local_link_ip || link.local_ip,
          local_ip: link.local_link_ip || link.local_ip,
          remote_device_ip: link.remote_device_ip,
          remote_link_ip: link.remote_link_ip || link.remote_ip,
          remote_ip: link.remote_link_ip || link.remote_ip || link.remote_interface_ip,
          destinationIp: link.remote_link_ip || link.remote_device_ip || link.remote_ip,
          ospf_state: link.ospf_state,
          is_ospf_full: link.is_ospf_full !== undefined ? Boolean(link.is_ospf_full) : (String(link.ospf_state || "").toUpperCase() === "FULL"),
          last_up_at: link.last_up_at,
          last_down_at: link.last_down_at,
          last_ospf_full_at: link.last_ospf_full_at,
          last_seen_at: link.last_seen_at,
          link_drops_last_24h: link.link_drops_last_24h ?? 0,
          ospf_drops_last_24h: link.ospf_drops_last_24h ?? 0,
          rawLink: link,
          isVisibleOnMap: isBothDevicesVisible,
        };

        linksBySignature.set(signature, linkObj);
        if (link.local_interface) endpointToSignature.set(localEp, signature);
        if (link.remote_interface) endpointToSignature.set(remoteEp, signature);
      });
    });

    const allDrawerLinks = Array.from(linksBySignature.values());
    const transformedLinks = allDrawerLinks.filter((l) => l.isVisibleOnMap);

    return {
      nodes: transformedNodes,
      links: transformedLinks,
      drawerLinks: allDrawerLinks,
    };
  }, [allTopologyDevices]);

  // All event handlers
  const handleZoneClick = useCallback(
    (zoneId) => {
      navigate(`/p-chart/zone/${zoneId}`);
    },
    [navigate]
  );

  const handleNodeClick = useCallback(
    (nodeData) => {
      const zone = nodeData?.zone || nodeData?.zoneName || "Zone";
      const hostname = nodeData?.hostname || nodeData?.id || nodeData?.name;
      if (hostname) {
        navigate(`/p-chart/zone/${zone}/node/${hostname}`);
      }
    },
    [navigate]
  );

  const handleLinkClick = useCallback((linkDetailPayload) => {
    if (!linkDetailPayload) return;
    const src =
      typeof linkDetailPayload.source === "object"
        ? linkDetailPayload.source?.id || linkDetailPayload.source?.hostname || linkDetailPayload.source?.name
        : linkDetailPayload.sourceNode || linkDetailPayload.sourceName || linkDetailPayload.source;
    const tgt =
      typeof linkDetailPayload.target === "object"
        ? linkDetailPayload.target?.id || linkDetailPayload.target?.hostname || linkDetailPayload.target?.name
        : linkDetailPayload.targetNode || linkDetailPayload.targetName || linkDetailPayload.target;

    setPopupLink({
      data: { ...linkDetailPayload, skipFetch: true, isCoreTopology: true },
      type: "link",
      title: `${src || "Device A"} ⟷ ${tgt || "Device B"}`,
    });
  }, []);

  const handleClosePopup = useCallback(() => {
    setPopupLink(null);
  }, []);

  const handleToggleDetailView = useCallback(() => {
    setShowDetailedLinks((prev) => !prev);
  }, []);

  const handleRetry = () => dispatch(fetchInitialData());

  // --- Loading, Error, and Empty State Rendering Logic ---
  const isLoading = topologyStatus === "loading";
  const hasError = topologyStatus === "failed";
  const isDataEmpty = !isLoading && !hasError && graphData.nodes.length === 0;

  if (isLoading) {
    return <LoadingSpinner text="Building P-Chart..." />;
  }

  if (hasError) {
    return <ErrorMessage onRetry={handleRetry} />;
  }

  if (isDataEmpty) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          No Data Available
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          There is no network data available to build the P-Chart.
        </p>
      </div>
    );
  }

  // --- Original component return for successful data load ---
  return (
    <div className="w-full h-full flex flex-col">
      <LinkDetailPopup
        linkData={popupLink?.data || null}
        linkType={popupLink?.type || "link"}
        linkTitle={popupLink?.title || ""}
        onClose={handleClosePopup}
        theme={theme}
      />

      <div className="flex-grow relative overflow-hidden">
        <NetworkLinksSideDrawer
          links={graphData.drawerLinks}
          onLinkClick={handleLinkClick}
          theme={theme}
          chartName="P-Network"
          isOpen={isDrawerOpen}
          onOpenChange={handleOpenChange}
          activeFilter={activeFilter}
          onActiveFilterChange={setActiveFilter}
          pingSubFilter={pingSubFilter}
          onPingSubFilterChange={setPingSubFilter}
          markedLinkIds={markedLinkIds}
          onToggleMarkLink={handleToggleMarkLink}
          onMarkAll={handleMarkAll}
          onClearMarks={handleClearMarks}
          onHoverLink={setHoveredLinkId}
          onHoverFilter={setHoveredFilter}
        />
        <NetworkVisualizer5
          key={`${theme}-detailed`}
          data={graphData}
          theme={theme}
          showDetailedLinks={true}
          isDrawerOpen={isDrawerOpen}
          activeFilter={isDrawerOpen ? activeFilter : null}
          pingSubFilter={pingSubFilter}
          markedLinkIds={markedLinkIds}
          hoveredLinkId={hoveredLinkId}
          hoveredFilter={hoveredFilter}
          trafficByZone={trafficByZone}
          onZoneClick={handleZoneClick}
          onLinkClick={handleLinkClick}
          onNodeClick={handleNodeClick}
        />
      </div>
    </div>
  );
};

export default NetworkVisualizer5Wrapper;
