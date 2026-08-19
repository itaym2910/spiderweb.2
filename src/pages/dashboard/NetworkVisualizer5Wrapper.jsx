import React, { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import NetworkVisualizer5 from "../../components/chart/NetworkVisualizer5";
import LinkDetailPopup from "../../components/shared/LinkDetailPopup";
import NetworkLinksSideDrawer from "../../components/chart/NetworkLinksSideDrawer";
import { selectPikudimByTypeId } from "../../redux/slices/corePikudimSlice";
import { selectDevicesByTypeId } from "../../redux/slices/devicesSlice";
import { selectLinksByTypeId } from "../../redux/slices/tenGigLinksSlice";
import ToggleDetailButton from "../../components/chart/ToggleDetailButton";
import { fetchInitialData } from "../../redux/slices/authSlice";

// Import reusable feedback components
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

const NetworkVisualizer5Wrapper = ({ theme }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data fetching status from Redux
  const pikudimStatus = useSelector((state) => state.corePikudim.status);
  const devicesStatus = useSelector((state) => state.devices.status);
  const linksStatus = useSelector((state) => state.tenGigLinks.status);

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

  // Selectors for P-Chart data (typeId: 2)
  const pikudim = useSelector((state) => selectPikudimByTypeId(state, 2));
  const allDevicesForType = useSelector((state) =>
    selectDevicesByTypeId(state, 2)
  );
  const linksRaw = useSelector((state) => selectLinksByTypeId(state, 2));

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
        `Zone ${siteId}`;

      return {
        id: device.hostname || device.name,
        group: "node",
        zone: zoneName,
      };
    });

    const nodeZoneMap = new Map(transformedNodes.map((n) => [n.id, n.zone]));

    const transformedLinks = linksRaw
      .map((link) => {
        const sourceDeviceId = link.coredevice_id ?? link.source_device_id ?? link.source_id;
        const targetDeviceId = link.neighbor_coredevice_id ?? link.neighbor_device_id ?? link.target_id;
        const sourceDev = deviceMapById.get(sourceDeviceId) || (typeof link.source === "object" ? link.source : null);
        const targetDev = deviceMapById.get(targetDeviceId) || (typeof link.target === "object" ? link.target : null);
        const sourceName =
          (typeof link.source === "string" ? link.source : null) || sourceDev?.hostname || sourceDev?.name;
        const targetName =
          (typeof link.target === "string" ? link.target : null) || targetDev?.hostname || targetDev?.name;

        return {
          ...link,
          id: link.id,
          source: sourceName,
          target: targetName,
          sourceZone: nodeZoneMap.get(sourceName) || "Core",
          targetZone: nodeZoneMap.get(targetName) || "Core",
          category: link.physical_status || link.physicalStatus || link.status || "Up",
          status: link.status || link.physical_status || link.physicalStatus || "up",
          statusChangedAt: link.statusChangedAt || link.timestamp,
        };
      })
      .filter(
        (link) =>
          link.source &&
          link.target &&
          visibleDeviceHostnames.has(link.source) &&
          visibleDeviceHostnames.has(link.target)
      );

    return { nodes: transformedNodes, links: transformedLinks };
  }, [pikudim, allDevicesForType, linksRaw, deviceMapById]);

  // All event handlers (unchanged)
  const handleZoneClick = useCallback(
    (zoneId) => {
      navigate(`zone/${zoneId}`);
    },
    [navigate]
  );

  const handleNodeClick = useCallback(
    (nodeData) => {
      if (nodeData && nodeData.id && nodeData.zone) {
        navigate(`zone/${nodeData.zone}/node/${nodeData.id}`);
      } else {
        console.warn("Node data incomplete for navigation:", nodeData);
      }
    },
    [navigate]
  );

  const handleLinkClick = useCallback(
    (linkDetailPayload) => {
      const { sourceNode, targetNode, sourceName, targetName } = linkDetailPayload;
      const src = sourceNode || sourceName;
      const tgt = targetNode || targetName;
      setPopupLink({
        data: linkDetailPayload,
        type: "link",
        title: `${src} - ${tgt}`,
      });
    },
    []
  );

  const handleClosePopup = useCallback(() => {
    setPopupLink(null);
  }, []);

  const handleToggleDetailView = useCallback(() => {
    setShowDetailedLinks((prev) => !prev);
  }, []);

  const handleRetry = () => dispatch(fetchInitialData());

  // --- NEW: Loading, Error, and Empty State Rendering Logic ---
  const isLoading =
    pikudimStatus === "loading" ||
    devicesStatus === "loading" ||
    linksStatus === "loading";
  const hasError =
    pikudimStatus === "failed" ||
    devicesStatus === "failed" ||
    linksStatus === "failed";

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
