import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

// --- Redux Imports ---
import { selectAllSites } from "../redux/slices/sitesSlice";
import { selectAllTenGigLinks } from "../redux/slices/tenGigLinksSlice";
import { selectAllDevices } from "../redux/slices/devicesSlice";
import { selectTopologyDevices } from "../redux/slices/coreTopologySlice";
import {
  selectFavoriteIds,
  toggleFavoriteLink,
} from "../redux/slices/favoritesSlice";

/**
 * The "Single Source of Truth" Hook for all network connections.
 * Merges backend sites data and 10G trunk links into a unified schema for table display.
 */
export function useInterfaceData() {
  const dispatch = useDispatch();

  // 1. Get raw data from Redux store
  const allSites = useSelector(selectAllSites);
  const allTenGigLinks = useSelector(selectAllTenGigLinks);
  const allDevices = useSelector(selectAllDevices);
  const allTopologyDevices = useSelector(selectTopologyDevices);
  const favoriteIds = useSelector(selectFavoriteIds);

  // 3. Create list of device options for filter dropdown
  const deviceFilterOptions = useMemo(() => {
    if (!Array.isArray(allDevices)) return [{ id: "all", label: "all" }];
    
    const options = allDevices
      .filter((d) => d && d.id && (d.hostname || d.name))
      .map((d) => ({ id: String(d.id), label: d.hostname || d.name }));
      
    // Deduplicate by ID
    const uniqueMap = new Map();
    options.forEach((opt) => {
      if (!uniqueMap.has(opt.id)) {
        uniqueMap.set(opt.id, opt.label);
      }
    });
    
    const uniqueOptions = Array.from(uniqueMap.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
      
    return [{ id: "all", label: "all" }, ...uniqueOptions];
  }, [allDevices]);

  // 4. Transform and merge data from backend endpoints
  const rawLinks = useMemo(() => {
    // Transform 10-Gigabit Core Links
    return (Array.isArray(allTenGigLinks) ? allTenGigLinks : []).map((link) => {
      // Status logic: down if physical status or protocol status is down, else up
      const physStatus = (link.pysical_status || link.physical_status || "").toLowerCase();
      const protoStatus = (link.protocol_status || "").toLowerCase();
      const status = (physStatus.includes("down") || protoStatus.includes("down")) ? "Down" : "Up";

      // Device logic: coredevice.name <-> neighbor_site.name
      const coreDeviceName = link.coredevice?.name || "Unknown Device";
      // Fallback to neighbor_coredevice if neighbor_site is null, just in case
      const neighborName = link.neighbor_site?.name || link.neighbor_coredevice?.name || "Unknown Site";
      const deviceName = `${coreDeviceName} <-> ${neighborName}`;

      // Interface Name: replace with link.name
      const interfaceName = link.name || "Unknown Interface";

      const linkId = String(link.id ?? `link-${Math.random()}`);

      return {
        id: linkId,
        deviceName: deviceName,
        interfaceName: interfaceName,
        description: link.description || "",
        status: status,
        trafficIn: link.input_rate != null ? String(link.input_rate) : "N/A",
        trafficOut: link.output_rate != null ? String(link.output_rate) : "N/A",
        errors: {
          in: Number(link.input_errors ?? 0),
          out: Number(link.output_errors ?? 0),
        },
      };
    });
  }, [allTenGigLinks]);

  // 5. Inject favorite flag based on Redux favorite IDs
  const interfaces = useMemo(() => {
    const favSet = new Set(Array.isArray(favoriteIds) ? favoriteIds : []);
    return rawLinks.map((link) => ({
      ...link,
      isFavorite: favSet.has(link.id) || favSet.has(Number(link.id)),
    }));
  }, [rawLinks, favoriteIds]);

  // 6. Action handler
  const handleToggleFavorite = useCallback(
    (linkId) => {
      dispatch(toggleFavoriteLink(linkId));
    },
    [dispatch]
  );

  const siteCount = Array.isArray(allSites) ? allSites.length : 0;
  const linkCount = Array.isArray(allTenGigLinks) ? allTenGigLinks.length : 0;

  return { interfaces, handleToggleFavorite, deviceFilterOptions, siteCount, linkCount };
}
