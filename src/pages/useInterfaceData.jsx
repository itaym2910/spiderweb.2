import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { faker } from "@faker-js/faker";

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

  // --- Step 3: Transform, combine, and merge all data (the core logic) ---
  const interfaces = useMemo(() => {
    // --- A. Transform Site Connections into the common format ---
    const siteConnections = allSites.map((site) => {
      const device = deviceMap.get(site.device_id);
      return {
        id: `site-${site.id}-${site.device_id}`,
        deviceName: device?.hostname || "Unknown Device",
        interfaceName: `Port ${site.interface_id}`,
        description: `Connection to site: ${site.site_name_english}`,
        status: "Up",
        trafficIn: `${faker.number.int({ min: 1, max: 800 })} Mbps`,
        trafficOut: `${faker.number.int({ min: 1, max: 800 })} Mbps`,
        errors: {
          in: faker.number.int({ max: 5 }),
          out: faker.number.int({ max: 2 }),
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
        trafficIn: `${faker.number.float({
          min: 1,
          max: 9,
          precision: 0.1,
        })} Gbps`,
        trafficOut: `${faker.number.float({
          min: 1,
          max: 9,
          precision: 0.1,
        })} Gbps`,
        errors: {
          in: faker.number.int({ max: 20 }),
          out: faker.number.int({ max: 15 }),
        },
      };
    });

    // C. Combine all transformed data into one master array
    const allLinks = [...siteConnections, ...tenGigCoreLinks];

    // D. Add the `isFavorite` property to each item
    return allLinks.map((link) => ({
      ...link,
      isFavorite: favoriteIds.includes(link.id),
    }));
  }, [allSites, allTenGigLinks, deviceMap, favoriteIds]);

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
