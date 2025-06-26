// src/hooks/useInterfaceData.js (or wherever it is located)

import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux"; // <-- Import useDispatch
import { faker } from "@faker-js/faker";

import { selectAllSites } from "../redux/slices/sitesSlice";
import { selectAllTenGigLinks } from "../redux/slices/tenGigLinksSlice";
import { selectAllDevices } from "../redux/slices/devicesSlice";
// --- 1. IMPORT the Redux selector and action ---
import {
  selectFavoriteIds,
  toggleFavorite,
} from "../redux/slices/favoritesSlice";

export function useInterfaceData() {
  const dispatch = useDispatch(); // <-- Get the dispatch function

  // --- 2. GET data from the global Redux store ---
  const allSites = useSelector(selectAllSites);
  const allTenGigLinks = useSelector(selectAllTenGigLinks);
  const allDevices = useSelector(selectAllDevices);
  const favoriteIds = useSelector(selectFavoriteIds); // <-- Get favorite IDs from Redux

  // --- REMOVED: The local `useState` for favorites is gone! ---
  // const [favoriteIds, setFavoriteIds] = useState(new Set());

  const deviceMap = useMemo(
    () => new Map(allDevices.map((d) => [d.id, d])),
    [allDevices]
  );

  // The logic for combining data is the same, but now `favoriteIds` comes from Redux.
  // This `useMemo` will now correctly re-run whenever the GLOBAL favorite state changes.
  const interfaces = useMemo(() => {
    const siteConnections = allSites.map((site) => {
      const device = deviceMap.get(site.device_id);
      return {
        id: `site-${site.id}`,
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

    const allLinks = [...siteConnections, ...tenGigCoreLinks];

    return allLinks.map((link) => ({
      ...link,
      isFavorite: favoriteIds.has(link.id),
    }));
  }, [allSites, allTenGigLinks, deviceMap, favoriteIds]);

  // --- 3. REWRITE the handler to dispatch a Redux action ---
  const handleToggleFavorite = useCallback(
    (linkId) => {
      // Instead of calling a local `set...` function, we dispatch a global action.
      dispatch(toggleFavorite(linkId));
    },
    [dispatch]
  );

  return { interfaces, handleToggleFavorite };
}
