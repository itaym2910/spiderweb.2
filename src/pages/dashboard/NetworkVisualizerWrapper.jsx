import React, { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import NetworkVisualizer from "../../components/chart/NetworkVisualizer";
import LinkDetailPopup from "../../components/shared/LinkDetailPopup";
import NetworkLinksSideDrawer from "../../components/chart/NetworkLinksSideDrawer";
import { selectPikudimByTypeId } from "../../redux/slices/corePikudimSlice";
import { selectDevicesByTypeId } from "../../redux/slices/devicesSlice";
import { selectLinksByTypeId } from "../../redux/slices/tenGigLinksSlice";
import ToggleDetailButton from "../../components/chart/ToggleDetailButton";
import { fetchInitialData } from "../../redux/slices/authSlice";

// Import feedback components
import { LoadingSpinner } from "../../components/ui/feedback/LoadingSpinner";
import { ErrorMessage } from "../../components/ui/feedback/ErrorMessage";

// Helper function to select top devices (no changes)
function selectTopTwoDevices(devices) {
  if (devices.length <= 2) return devices;
  const priorityOrder = [4, 5, 1, 2, 7, 8];
  const sortedDevices = [...devices].sort((a, b) => {
    const a_ending = parseInt(a.hostname.split("-").pop(), 10);
    const b_ending = parseInt(b.hostname.split("-").pop(), 10);
    const a_priority = priorityOrder.indexOf(a_ending);
    const b_priority = priorityOrder.indexOf(b_ending);
    const final_a_priority = a_priority === -1 ? 99 : a_priority;
    const final_b_priority = b_priority === -1 ? 99 : b_priority;
    return final_a_priority - final_b_priority;
  });
  return sortedDevices.slice(0, 2);
}

const NetworkVisualizerWrapper = ({ theme }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data fetching status from Redux
  const pikudimStatus = useSelector((state) => state.corePikudim.status);
  const devicesStatus = useSelector((state) => state.devices.status);
  const linksStatus = useSelector((state) => state.tenGigLinks.status);

  // Existing state and selectors...
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

  // --- These selectors correctly get the filtered data ---
  const pikudim = useSelector((state) => selectPikudimByTypeId(state, 1));
  const allDevicesForType = useSelector((state) =>
    selectDevicesByTypeId(state, 1)
  );
  const linksRaw = useSelector((state) => selectLinksByTypeId(state, 1));

  const deviceMapById = useMemo(() => {
    return new Map(allDevicesForType.map((d) => [d.id, d]));
  }, [allDevicesForType]);

  const graphData = useMemo(() => {
    if (!pikudim.length || !allDevicesForType.length) {
      return { nodes: [], links: [] };
    }

    const devicesByPikudId = allDevicesForType.reduce((acc, device) => {
      const siteId = device.core_pikudim_site_id || device.coresite_id;
      if (siteId !== undefined) {
        if (!acc[siteId]) {
          acc[siteId] = [];
        }
        acc[siteId].push(device);
      }
      return acc;
    }, {});

    const topDevicesPerPikud = Object.values(devicesByPikudId).flatMap(
      (deviceGroup) => selectTopTwoDevices(deviceGroup)
    );

    const visibleDeviceHostnames = new Set(
      topDevicesPerPikud.map((d) => d.hostname || d.name)
    );

    const pikudimMap = pikudim.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    const transformedNodes = topDevicesPerPikud.map((device) => {
      const siteId = device.core_pikudim_site_id || device.coresite_id;
      const zoneName =
        pikudimMap[siteId]?.core_site_name ||
        pikudimMap[siteId]?.name ||
        `Pikud ${siteId}`;

      return {
        id: device.hostname || device.name,
        name: device.hostname || device.name,
        ip: device.ip,
        zone: zoneName,
        pikudId: siteId,
        nodeType: device.node_type || "router",
        device: device,
      };
    });

    const transformedLinks = linksRaw
      .filter((link) => {
        const sourceDeviceId = link.coredevice_id ?? link.source_device_id ?? link.source_id;
        const neighborDeviceId = link.neighbor_coredevice_id ?? link.neighbor_device_id ?? link.target_id;
        const sourceDevice = deviceMapById.get(sourceDeviceId) || (typeof link.source === "object" ? link.source : null);
        const neighborDevice = deviceMapById.get(neighborDeviceId) || (typeof link.target === "object" ? link.target : null);
        if (!sourceDevice || !neighborDevice) return false;

        const sourceHostname = sourceDevice.hostname || sourceDevice.name || link.source;
        const neighborHostname = neighborDevice.hostname || neighborDevice.name || link.target;

        return (
          visibleDeviceHostnames.has(sourceHostname) &&
          visibleDeviceHostnames.has(neighborHostname)
        );
      })
      .map((link) => {
        const sourceDeviceId = link.coredevice_id ?? link.source_device_id ?? link.source_id;
        const neighborDeviceId = link.neighbor_coredevice_id ?? link.neighbor_device_id ?? link.target_id;
        const sourceDevice = deviceMapById.get(sourceDeviceId) || (typeof link.source === "object" ? link.source : null);
        const neighborDevice = deviceMapById.get(neighborDeviceId) || (typeof link.target === "object" ? link.target : null);
        const sourceHostname = sourceDevice?.hostname || sourceDevice?.name || link.source;
        const neighborHostname = neighborDevice?.hostname || neighborDevice?.name || link.target;
        const sourceSiteId = sourceDevice?.core_pikudim_site_id || sourceDevice?.coresite_id;
        const targetSiteId = neighborDevice?.core_pikudim_site_id || neighborDevice?.coresite_id;
        const sourceZone = pikudimMap[sourceSiteId]?.core_site_name || pikudimMap[sourceSiteId]?.name || `Pikud ${sourceSiteId}`;
        const targetZone = pikudimMap[targetSiteId]?.core_site_name || pikudimMap[targetSiteId]?.name || `Pikud ${targetSiteId}`;

        const normalized = (link.status || link.physical_status || "").toLowerCase().includes("down")
          ? "down"
          : (link.status || link.physical_status || "").toLowerCase().includes("issue")
          ? "issue"
          : "up";

        return {
          ...link,
          id: link.id,
          source: sourceHostname,
          target: neighborHostname,
          sourceName: sourceHostname,
          targetName: neighborHostname,
          sourceZone,
          targetZone,
          physical_status: link.physical_status,
          protocol_status: link.protocol_status,
          category: normalized,
          status: normalized,
          normalizedStatus: normalized,
          statusChangedAt: link.statusChangedAt || link.status_changed_at || link.updated_at || link.timestamp,
          linkType: "core",
          bandwidth: link.bandwidth || link.bw || "10G",
          rawLink: link,
        };
      });

    return {
      nodes: transformedNodes,
      links: transformedLinks,
    };
  }, [pikudim, allDevicesForType, linksRaw, deviceMapById]);

  const handleZoneClick = (zone) => {
    navigate(
      `/devices?tab=pikudim&siteId=${zone.id}&name=${encodeURIComponent(
        zone.name
      )}`
    );
  };

  const handleNodeClick = (node) => {
    const deviceId = node.device?.id;
    if (deviceId) {
      navigate(`/devices?tab=devices&deviceId=${deviceId}`);
    }
  };

  const handleLinkClick = (linkData) => {
    setPopupLink({
      data: linkData,
      type: linkData.linkType || "link",
      title: `${linkData.sourceNode || linkData.source} ⟷ ${
        linkData.targetNode || linkData.target
      }`,
    });
  };

  const handleClosePopup = useCallback(() => {
    setPopupLink(null);
  }, []);

  const handleToggleDetailView = useCallback(() => {
    setShowDetailedLinks((prev) => !prev);
  }, []);

  const handleRetry = () => dispatch(fetchInitialData());

  // --- Loading and Error Rendering Logic ---
  const isLoading =
    pikudimStatus === "loading" ||
    devicesStatus === "loading" ||
    linksStatus === "loading";
  const hasError =
    pikudimStatus === "failed" ||
    devicesStatus === "failed" ||
    linksStatus === "failed";

  // This state is derived after loading/errors are handled
  const isDataEmpty = !isLoading && !hasError && graphData.nodes.length === 0;

  if (isLoading) {
    return <LoadingSpinner text="Building L-Chart..." />;
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
          There is no network data available to build the L-Chart.
        </p>
      </div>
    );
  }

  // --- Original component return ---
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
          chartName="L-Network"
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
        <NetworkVisualizer
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

export default NetworkVisualizerWrapper;
