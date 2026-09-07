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
} from "../../redux/slices/coreTopologySlice";

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

  // Get topology data from the unified coreTopology slice
  const allTopologyDevices = useSelector(selectTopologyDevices);
  const topologyStatus = useSelector(selectTopologyStatus);

  // Local UI state
  const [popupLink, setPopupLink] = useState(null);
  const [showDetailedLinks, setShowDetailedLinks] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [markedLinkIds, setMarkedLinkIds] = useState(new Set());
  const [hoveredLinkId, setHoveredLinkId] = useState(null);

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
    const devicesForChart = allTopologyDevices.filter((d) => {
      if (!d.name || !d.network_name) return false;
      const hasSharedName = ["H1", "H2", "H4", "H5", "H7", "H8"].some((str) => d.name.includes(str));
      const isPNetwork = d.network_name.includes("anan-lekaman") || d.network_name.includes("anan_lekaman");
      return hasSharedName || isPNetwork;
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
      zone: device.coresite_name,
      pikudId: device.coresite_name,
      nodeType: "router",
      device: device,
    }));

    // Extract and deduplicate links from devices
    const seenLinkIds = new Set();
    const seenSignatures = new Set();
    const transformedLinks = [];

    topDevicesPerSite.forEach((device) => {
      if (!device.links) return;

      device.links.forEach((link) => {
        // Skip duplicates by ID
        if (seenLinkIds.has(link.id)) return;

        // Only include links where the remote device is also visible
        const remoteDevice = deviceMapById.get(link.remote_device_id);
        if (!remoteDevice || !visibleDeviceNames.has(remoteDevice.name)) return;

        // Deduplicate switched ports
        const ep1 = `${device.name}::${link.local_interface || ""}`;
        const ep2 = `${remoteDevice.name}::${link.remote_interface || ""}`;
        const signature = [ep1, ep2].sort().join("---");
        
        if (seenSignatures.has(signature)) return;

        seenLinkIds.add(link.id);
        seenSignatures.add(signature);

        // Normalize oper_status to up/down/issue
        const operStatus = (link.oper_status || "").toLowerCase();
        const normalized = operStatus.includes("down")
          ? "down"
          : operStatus.includes("issue")
          ? "issue"
          : "up";

        transformedLinks.push({
          id: link.id,
          source: device.name,
          target: remoteDevice.name,
          sourceName: device.name,
          targetName: remoteDevice.name,
          sourceZone: device.coresite_name,
          targetZone: remoteDevice.coresite_name,
          physical_status: link.oper_status,
          protocol_status: link.admin_status,
          category: normalized,
          status: normalized,
          normalizedStatus: normalized,
          statusChangedAt: link.last_state_change_at,
          linkType: "core",
          bandwidth: link.bandwidth_mbps || "10G",
          local_interface: link.local_interface,
          remote_interface: link.remote_interface,
          local_ip: link.local_link_ip || link.local_ip,
          remote_ip: link.remote_link_ip || link.remote_ip || link.remote_interface_ip,
          ospf_state: link.ospf_state,
          is_ospf_full: link.ospf_state === "FULL" || link.is_ospf_full,
          link_drops_last_24h: link.link_drops_last_24h,
          ospf_drops_last_24h: link.ospf_drops_last_24h,
          rawLink: link,
        });
      });
    });

    return {
      nodes: transformedNodes,
      links: transformedLinks,
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
      data: linkDetailPayload,
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
          links={graphData.links}
          onLinkClick={handleLinkClick}
          theme={theme}
          chartName="P-Network"
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          markedLinkIds={markedLinkIds}
          onToggleMarkLink={handleToggleMarkLink}
          onMarkAll={handleMarkAll}
          onClearMarks={handleClearMarks}
          onHoverLink={setHoveredLinkId}
        />
        <NetworkVisualizer5
          key={`${theme}-detailed`}
          data={graphData}
          theme={theme}
          showDetailedLinks={true}
          isDrawerOpen={isDrawerOpen}
          markedLinkIds={markedLinkIds}
          hoveredLinkId={hoveredLinkId}
          onZoneClick={handleZoneClick}
          onLinkClick={handleLinkClick}
          onNodeClick={handleNodeClick}
        />
      </div>
    </div>
  );
};

export default NetworkVisualizer5Wrapper;
