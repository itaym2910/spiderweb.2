import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeLayout } from "./useNodeLayout";
import { api } from "../../services/apiServices";

export function useCoreSiteData(chartType) {
  const { zoneId, nodeId: nodeIdFromUrl } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showExtendedNodes, setShowExtendedNodes] = useState(false);
  const [animateExtendedLayoutUp, setAnimateExtendedLayoutUp] = useState(false);
  const [previousSelectedNodeId, setPreviousSelectedNodeId] = useState(null);
  const [popupDetail, setPopupDetail] = useState(null);

  // New local states for API data
  const [localDevices, setLocalDevices] = useState([]);
  const [localSites, setLocalSites] = useState([]);
  const [localLinks, setLocalLinks] = useState([]);

  // 1. Fetch data from the endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        const networkId = chartType === "P" ? 2 : 1;

        // Fetch core sites to find the ID for the current zoneId (name)
        const coreSites = await api.getCoreSites(networkId).catch(() => []);
        const site = coreSites.find(s => s.name === zoneId || s.core_site_name === zoneId);

        if (site) {
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

            // Original method fallback for L Network devices that aren't specifically caught above
            const originalMatches = name.match(/[a-zA-Z]\d+/g);
            return originalMatches ? originalMatches[originalMatches.length - 1].toUpperCase() : name;
          };

          const devices = await api.getCoreDevicesBySite(networkId, site.id).catch(() => []);
          
          const getEnding = (n) => {
            if (!n) return "";
            const match = n.match(/(\d+)(?!.*\d)/);
            return match ? parseInt(match[1], 10) : 99;
          };

          const priorityOrder = [4, 5, 1, 2, 7, 8];
          const sortedDevices = [...devices].sort((a, b) => {
            const a_ending = getEnding(a.hostname || a.name);
            const b_ending = getEnding(b.hostname || b.name);
            const a_p = priorityOrder.indexOf(a_ending) === -1 ? 99 : priorityOrder.indexOf(a_ending);
            const b_p = priorityOrder.indexOf(b_ending) === -1 ? 99 : priorityOrder.indexOf(b_ending);
            return a_p - b_p;
          });

          // Normalize device hostname/name for useNodeLayout
          const normalizedDevices = sortedDevices.map(d => ({
            ...d,
            hostname: d.hostname || d.name,
            shortName: getShortName(d.hostname || d.name),
          }));
          setLocalDevices(normalizedDevices);

          // Fetch links for each device in the zone
          const linksArrays = await Promise.all(
            devices.map(async (d) => {
              return await api.getLinksTopologyByDevice(d.id).catch(() => []);
            })
          );
          const allDeviceLinks = linksArrays.flat();

          // Deduplicate links by ID
          const uniqueLinksMap = new Map();
          allDeviceLinks.forEach((link) => {
            if (link && link.id) {
              uniqueLinksMap.set(link.id, link);
            }
          });
          setLocalLinks(Array.from(uniqueLinksMap.values()));
        }

        const sites = await api.getSites().catch(() => []);
        setLocalSites(sites);
      } catch (err) {
        console.error("Failed to fetch zone data", err);
      }
    };
    fetchData();
  }, [zoneId, chartType]);

  // 2. Set the initially selected node once devices are loaded
  useEffect(() => {
    if (localDevices.length > 0 && !selectedNodeId) {
      const initialNodeId = nodeIdFromUrl || localDevices[0].hostname;
      setSelectedNodeId(initialNodeId);
      setPreviousSelectedNodeId(initialNodeId);
    }
  }, [localDevices, nodeIdFromUrl, selectedNodeId]);

  // 3. Process links for the core-to-core connections (Canvas)
  const mappedLinksForChart = useMemo(() => {
    return localLinks
      .filter(link => link.coredevice && link.neighbor_coredevice)
      .map(link => ({
        ...link,
        source: link.coredevice.name,
        target: link.neighbor_coredevice.name,
      }));
  }, [localLinks]);

  // 4. Process links for the sites at the bottom
  const sitesForFocusedNode = useMemo(() => {
    if (!selectedNodeId || !localLinks.length || !localSites.length) return [];

    const sites = [];
    localLinks.forEach(link => {
      // Must belong to the focused device
      if (link.coredevice && (link.coredevice.name === selectedNodeId || link.coredevice.hostname === selectedNodeId)) {
        // Must NOT be a core-to-core link
        if (!link.neighbor_coredevice || Object.keys(link.neighbor_coredevice).length === 0) {
          if (link.neighbor_site && link.neighbor_site.name) {
            // Must be in the /sites list
            const siteObj = localSites.find(s => s.name === link.neighbor_site.name);
            if (siteObj) {
              sites.push({ ...siteObj, linkId: link.id });
            }
          }
        }
      }
    });

    // Deduplicate sites if multiple links go to the same site
    const uniqueSites = [];
    const seenSiteNames = new Set();
    sites.forEach(s => {
      if (!seenSiteNames.has(s.name)) {
        seenSiteNames.add(s.name);
        uniqueSites.push(s);
      }
    });

    return uniqueSites;
  }, [selectedNodeId, localLinks, localSites]);

  useEffect(() => {
    if (showExtendedNodes) {
      setAnimateExtendedLayoutUp(false);
      const timer = setTimeout(() => setAnimateExtendedLayoutUp(true), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimateExtendedLayoutUp(false);
    }
  }, [showExtendedNodes]);

  useLayoutEffect(() => {
    setShowExtendedNodes(false);
  }, [zoneId]);

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    if (containerRef.current) updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const {
    nodes: layoutNodes,
    links: layoutLinks,
    centerX,
    centerY,
  } = useNodeLayout(
    dimensions.width,
    dimensions.height,
    showExtendedNodes,
    animateExtendedLayoutUp,
    localDevices,
    mappedLinksForChart
  );

  const nodes = layoutNodes.filter((node) => node.id !== "None");
  const links = layoutLinks.filter(
    (link) => link.source.id !== "None" && link.target.id !== "None"
  );

  const handleToggleExtendedNodes = () => {
    setShowExtendedNodes((prevShowExtended) => {
      const nextShowExtended = !prevShowExtended;
      if (nextShowExtended) {
        setPreviousSelectedNodeId(selectedNodeId);
        const newSelected = localDevices[2]?.hostname;
        if (newSelected) setSelectedNodeId(newSelected);
      } else {
        setSelectedNodeId(previousSelectedNodeId || localDevices[0]?.hostname);
      }
      return nextShowExtended;
    });
  };

  const onNodeClickInZone = (clickedNodeData) => {
    if (!clickedNodeData || !clickedNodeData.id) return;
    if (clickedNodeData.id === selectedNodeId) {
      navigate(`node/${clickedNodeData.id}`);
    } else {
      setSelectedNodeId(clickedNodeData.id);
    }
  };

  const openPopup = useCallback((payload) => {
    const { type } = payload;
    let title = "Details";
    if (type === "link") title = `${payload.sourceNode} - ${payload.targetNode}`;
    else if (type === "site") title = payload.name;
    setPopupDetail({ type, title, data: payload });
  }, []);

  const handleClosePopup = useCallback(() => {
    setPopupDetail(null);
  }, []);

  const handleNavigateToSite = useCallback((clickedSiteData) => {
    if (!clickedSiteData || !clickedSiteData.name) return;
    const navId = encodeURIComponent(clickedSiteData.name);
    navigate(`/sites/site/${navId}`, {
      state: { siteGroupData: [clickedSiteData] },
    });
  }, [navigate]);

  const handleSiteClick = (siteData) => {
    const siteDetailPayload = {
      id: siteData.id,
      navId: `site-${siteData.id}`,
      name: siteData.name,
      type: "site",
      zone: zoneId,
      description: `Details for ${siteData.name}`,
    };
    openPopup(siteDetailPayload);
  };

  const handleLinkClick = (linkData) => {
    const newLinkPayload = {
      id: linkData.id || `link-${linkData.source.id}-${linkData.target.id}`,
      type: "link",
      sourceNode: linkData.source.id,
      targetNode: linkData.target.id,
      name: `Link: ${linkData.source.id} ↔ ${linkData.target.id}`,
      linkBandwidth: linkData.bw || `${Math.floor(Math.random() * 1000) + 100} Gbps`,
      latency: `${Math.floor(Math.random() * 50) + 1} ms`,
      utilization: linkData.rx || `${Math.floor(Math.random() * 100)}%`,
      status: linkData.pysical_status || "up",
      linkId: linkData.id,
      linkDescription: linkData.description || "Core interconnect.",
    };
    openPopup(newLinkPayload);
  };

  return {
    zoneId,
    containerRef,
    dimensions,
    nodes,
    links,
    centerX,
    centerY,
    selectedNodeId,
    showExtendedNodes,
    handleToggleExtendedNodes,
    devicesInZoneCount: localDevices.length,
    sitesForFocusedNode,
    onSiteClick: handleSiteClick,
    onLinkClick: handleLinkClick,
    onNodeClickInZone,
    popupDetail,
    handleClosePopup,
    handleNavigateToSite,
  };
}
