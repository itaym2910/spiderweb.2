import React, { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import NetworkVisualizer from "./chart/NetworkVisualizer";
import LinkDetailTabs from "./LinkDetailTabs";
import { selectPikudimByTypeId } from "../redux/slices/corePikudimSlice";
import { selectDevicesByTypeId } from "../redux/slices/devicesSlice";
import { selectLinksByTypeId } from "../redux/slices/tenGigLinksSlice";

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

  const [openLinkTabs, setOpenLinkTabs] = useState([]);
  const [activeLinkTabId, setActiveLinkTabId] = useState(null);

  const pikudim = useSelector((state) => selectPikudimByTypeId(state, 1));
  const allDevicesForType = useSelector((state) =>
    selectDevicesByTypeId(state, 1)
  );
  const linksRaw = useSelector((state) => selectLinksByTypeId(state, 1));

  const graphData = useMemo(() => {
    if (!pikudim.length || !allDevicesForType.length) {
      return { nodes: [], links: [] };
    }

    const devicesByPikudId = allDevicesForType.reduce((acc, device) => {
      const siteId = device.core_pikudim_site_id;
      if (!acc[siteId]) {
        acc[siteId] = [];
      }
      acc[siteId].push(device);
      return acc;
    }, {});

    const topDevicesPerPikud = Object.values(devicesByPikudId).flatMap(
      (deviceGroup) => selectTopTwoDevices(deviceGroup)
    );

    const visibleDeviceHostnames = new Set(
      topDevicesPerPikud.map((d) => d.hostname)
    );

    const pikudimMap = pikudim.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});
    const transformedNodes = topDevicesPerPikud.map((device) => ({
      id: device.hostname,
      group: "node",
      zone:
        pikudimMap[device.core_pikudim_site_id]?.core_site_name ||
        "Unknown Zone",
    }));

    const transformedLinks = linksRaw
      .filter(
        (link) =>
          visibleDeviceHostnames.has(link.source) &&
          visibleDeviceHostnames.has(link.target)
      )
      .map((link) => ({
        id: link.id,
        source: link.source,
        target: link.target,
        category: link.status,
      }));

    return { nodes: transformedNodes, links: transformedLinks };
  }, [pikudim, allDevicesForType, linksRaw]);

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
      const { id, sourceNode, targetNode } = linkDetailPayload;
      const tabExists = openLinkTabs.some((tab) => tab.id === id);

      if (!tabExists) {
        const newTab = {
          id: id,
          title: `${sourceNode} - ${targetNode}`,
          type: "link",
          data: linkDetailPayload,
        };
        setOpenLinkTabs((prevTabs) => [...prevTabs, newTab]);
      }
      setActiveLinkTabId(id);
    },
    [openLinkTabs]
  );

  const handleCloseTab = useCallback(
    (tabIdToClose) => {
      setOpenLinkTabs((prevTabs) => {
        const remainingTabs = prevTabs.filter((tab) => tab.id !== tabIdToClose);
        if (activeLinkTabId === tabIdToClose) {
          setActiveLinkTabId(
            remainingTabs.length > 0
              ? remainingTabs[remainingTabs.length - 1].id
              : null
          );
        }
        return remainingTabs;
      });
    },
    [activeLinkTabId]
  );

  return (
    <div className="w-full h-full flex flex-col">
      {openLinkTabs.length > 0 && (
        <div className="flex-shrink-0">
          <LinkDetailTabs
            tabs={openLinkTabs}
            activeTabId={activeLinkTabId}
            onSetActiveTab={setActiveLinkTabId}
            onCloseTab={handleCloseTab}
            theme={theme}
          />
        </div>
      )}

      <div className="flex-grow relative">
        <NetworkVisualizer
          // [MODIFIED] - This is the fix. By changing the key, React will
          // destroy and recreate the component, forcing it to re-initialize with the new theme.
          key={theme}
          data={graphData}
          theme={theme}
          onZoneClick={handleZoneClick}
          onLinkClick={handleLinkClick}
          onNodeClick={handleNodeClick}
        />
      </div>
    </div>
  );
};

export default NetworkVisualizerWrapper;
