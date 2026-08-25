import React, { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import NetworkVisualizer5 from "../../components/chart/NetworkVisualizer5";
import LinkDetailPopup from "../../components/shared/LinkDetailPopup";
import NetworkLinksSideDrawer from "../../components/chart/NetworkLinksSideDrawer";
import ToggleDetailButton from "../../components/chart/ToggleDetailButton";
import { fetchInitialData } from "../../redux/slices/authSlice";
import {
  selectTopologyDevices,
  selectTopologyStatus,
} from "../../redux/slices/coreTopologySlice";

// Import reusable feedback components
import { LoadingSpinner } from "../../components/ui/feedback/LoadingSpinner";
import { ErrorMessage } from "../../components/ui/feedback/ErrorMessage";

// The network name used to filter devices for the P-Chart
const P_CHART_NETWORK_NAME = "P-Chart Network";

// Helper function to select top devices (no changes)
function selectTopTwoDevices(devices) {
  if (devices.length <= 2) return devices;
  const priorityOrder = [4, 5, 1, 2, 7, 8];
  const sortedDevices = [...devices].sort((a, b) => {
    const a_ending = parseInt(a.name.split("-").pop(), 10);
    const b_ending = parseInt(b.name.split("-").pop(), 10);
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
    const devicesForChart = allTopologyDevices.filter(
      (d) => d.network_name === P_CHART_NETWORK_NAME
    );

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

    // Build nodes
    const transformedNodes = topDevicesPerSite.map((device) => ({
      id: device.name,
      group: "node",
      zone: device.coresite_name,
    }));

    const nodeZoneMap = new Map(transformedNodes.map((n) => [n.id, n.zone]));

    // Extract and deduplicate links from devices
    const seenLinkIds = new Set();
    const transformedLinks = [];

    topDevicesPerSite.forEach((device) => {
      if (!device.links) return;

      device.links.forEach((link) => {
        // Skip duplicates (each link appears on both endpoints)
        if (seenLinkIds.has(link.id)) return;

        // Only include links where the remote device is also visible
        const remoteDevice = deviceMapById.get(link.remote_device_id);
        if (!remoteDevice || !visibleDeviceNames.has(remoteDevice.name)) return;

        seenLinkIds.add(link.id);

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
          sourceZone: nodeZoneMap.get(device.name) || "Core",
          targetZone: nodeZoneMap.get(remoteDevice.name) || "Core",
          category: normalized,
          status: normalized,
          normalizedStatus: normalized,
          statusChangedAt: link.last_state_change_at,
          bandwidth: link.bandwidth_mbps || "10G",
          local_interface: link.local_interface,
          remote_interface: link.remote_interface,
          local_ip: link.local_ip,
          remote_ip: link.remote_ip,
          ospf_state: link.ospf_state,
          is_ospf_full: link.is_ospf_full,
          link_drops_last_24h: link.link_drops_last_24h,
          ospf_drops_last_24h: link.ospf_drops_last_24h,
          rawLink: link,
        });
      });
    });

    return { nodes: transformedNodes, links: transformedLinks };
  }, [allTopologyDevices]);

  // All event handlers
  const handleZoneClick = useCallback(
    (zoneId) => {
      navigate(`zone/${zoneId}`);
    },
    [navigate]
  );

  const handleNodeClick = useCallback(
    (nodeData) => {
      const zone = nodeData?.zone || nodeData?.zoneName || "Zone";
      const hostname = nodeData?.hostname || nodeData?.id || nodeData?.name;
      if (hostname) {
        navigate(`zone/${zone}/node/${hostname}`);
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
        <ToggleDetailButton
          isDetailed={showDetailedLinks}
          onToggle={handleToggleDetailView}
          theme={theme}
        />
        <NetworkVisualizer5
          key={`${theme}-${showDetailedLinks}`}
          data={graphData}
          theme={theme}
          showDetailedLinks={showDetailedLinks}
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
