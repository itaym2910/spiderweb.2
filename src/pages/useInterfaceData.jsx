import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

// --- Redux Imports ---
// Selectors for raw data sources
import { selectAllSites } from "../redux/slices/sitesSlice";
import { selectAllTenGigLinks } from "../redux/slices/tenGigLinksSlice";
import { selectAllDevices } from "../redux/slices/devicesSlice";
// Selector and Action for the shared "favorites" state
import {
  selectFavoriteIds,
  toggleFavoriteLink, // <-- FIX #1: Use the correct name for the exported thunk
} from "../redux/slices/favoritesSlice"; // <-- Make sure the file extension is correct (.js or .jsx)

/**
 * The "Single Source of Truth" Hook for all network connections.
 * ... (rest of the JSDoc)
 */
export function useInterfaceData() {
  // Get the dispatch function to send actions to the Redux store
  const dispatch = useDispatch();

  // --- Step 1: Get all data from the global Redux store using selectors ---
  const allSites = useSelector(selectAllSites);
  const allTenGigLinks = useSelector(selectAllTenGigLinks);
  const allDevices = useSelector(selectAllDevices);

  // This gets the favorite IDs as a plain array, e.g., ['id-1', 'id-2']
  const favoriteIds = useSelector(selectFavoriteIds);

  // --- Step 2: Create efficient lookup maps (memoized for performance) ---
  const deviceMap = useMemo(
    () => new Map(allDevices.map((d) => [d.id, d])),
    [allDevices]
  );

  // --- NEW: Create a clean list of device names for the filter dropdown ---
  const deviceFilterOptions = useMemo(() => {
    // Get hostnames from the source of truth: allDevices
    const hostnames = allDevices.map((device) => device.hostname);
    // Add the "all" option and sort the list for a clean UI
    return ["all", ...hostnames.sort()];
  }, [allDevices]);

  // Deterministic helper to avoid random data changes when favoriteIds updates
  const getDeterministicVal = (id, salt, min, max, isFloat = false) => {
    let hash = 0;
    const str = `${id}-${salt}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const val = Math.abs(hash);
    if (isFloat) {
      const floatVal = min + (val % ((max - min) * 10)) / 10;
      return floatVal.toFixed(1);
    }
    return min + (val % (max - min + 1));
  };

  // --- Step 3: Transform, combine, and merge all data (the core logic) ---
  const rawLinks = useMemo(() => {
    // --- A. Transform Site Connections into the common format ---
    const siteConnections = allSites.map((site) => {
      const device = deviceMap.get(site.device_id);
      const siteKey = `site-${site.id}-${site.device_id}`;
      return {
        id: siteKey,
        deviceName: device?.hostname || device?.name || "Unknown Device",
        interfaceName: `Port ${site.interface_id}`,
        description: `Connection to site: ${site.site_name_english}`,
        status: "Up",
        trafficIn: `${getDeterministicVal(siteKey, "tIn", 10, 800)} Mbps`,
        trafficOut: `${getDeterministicVal(siteKey, "tOut", 10, 800)} Mbps`,
        errors: {
          in: getDeterministicVal(siteKey, "errIn", 0, 5),
          out: getDeterministicVal(siteKey, "errOut", 0, 2),
        },
      };
    });

    // B. Transform 10-Gigabit Core Links into the common format
    const tenGigCoreLinks = allTenGigLinks.map((link) => {
      const formattedStatus =
        link.status.charAt(0).toUpperCase() + link.status.slice(1);
      return {
        id: link.id,
        deviceName: `${link.source} <-> ${link.target}`,
        interfaceName: `10G Inter-Core Link`,
        description: `Inter-site trunk (${link.bandwidth})`,
        status: formattedStatus === "Issue" ? "Down" : formattedStatus,
        trafficIn: `${getDeterministicVal(link.id, "tIn", 1, 9, true)} Gbps`,
        trafficOut: `${getDeterministicVal(link.id, "tOut", 1, 9, true)} Gbps`,
        errors: {
          in: getDeterministicVal(link.id, "errIn", 0, 20),
          out: getDeterministicVal(link.id, "errOut", 0, 15),
        },
      };
    });

    return [...siteConnections, ...tenGigCoreLinks];
  }, [allSites, allTenGigLinks, deviceMap]);

  const interfaces = useMemo(() => {
    return rawLinks.map((link) => ({
      ...link,
      isFavorite: favoriteIds.includes(link.id),
    }));
  }, [rawLinks, favoriteIds]);

  // --- Step 4: Create a stable function to handle user actions ---
  const handleToggleFavorite = useCallback(
    (linkId) => {
      // FIX #2: Dispatch the async thunk with the correct name
      dispatch(toggleFavoriteLink(linkId));
    },
    [dispatch]
  );

  // --- Step 5: Return the final data and the action handler ---
  return { interfaces, handleToggleFavorite, deviceFilterOptions };
}
