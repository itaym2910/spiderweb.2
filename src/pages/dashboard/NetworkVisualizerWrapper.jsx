// src/components/NetworkVisualizerWrapper.jsx

import React, { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import NetworkVisualizer from "../../components/chart/NetworkVisualizer";
import LinkDetailPopup from "../../components/shared/LinkDetailPopup";
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
        `Zone ${siteId}`;

      return {
        id: device.hostname || device.name,
        group: "node",
        zone: zoneName,
      };
    });

    const transformedLinks = linksRaw
      .map((link) => {
        const sourceDev = deviceMapById.get(link.coredevice_id);
        const targetDev = deviceMapById.get(link.neighbor_coredevice_id);
        const sourceName =
          link.source || sourceDev?.hostname || sourceDev?.name;
        const targetName =
          link.target || targetDev?.hostname || targetDev?.name;

        return {
          id: link.id,
          source: sourceName,
          target: targetName,
          category: link.physical_status || link.status || "Up",
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

  // All handlers are unchanged
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
      const { sourceNode, targetNode } = linkDetailPayload;
      setPopupLink({
        data: linkDetailPayload,
        type: "link",
        title: `${sourceNode} - ${targetNode}`,
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

      <div className="flex-grow relative">
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
          onZoneClick={handleZoneClick}
          onLinkClick={handleLinkClick}
          onNodeClick={handleNodeClick}
        />
      </div>
    </div>
  );
};

export default NetworkVisualizerWrapper;
