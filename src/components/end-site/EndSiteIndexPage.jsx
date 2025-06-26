import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAllSites } from "../../redux/slices/sitesSlice";
import { selectAllDevices } from "../../redux/slices/devicesSlice";
import { selectAllPikudim } from "../../redux/slices/corePikudimSlice";

// --- UPDATED SiteCard Component ---
// Now it accepts a group of sites and maps to display all connections.
const SiteCard = ({ siteGroup, deviceMap, pikudMap, onClick }) => {
  // All sites in the group share the same name, so we can take it from the first one.
  const primarySite = siteGroup[0];

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-transparent dark:hover:border-blue-500 hover:border-blue-400 flex flex-col"
    >
      {/* Shared Site Info */}
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 truncate">
          {primarySite.site_name_english}
        </h3>
        <p
          className="text-sm text-gray-500 dark:text-gray-400 truncate"
          title={primarySite.site_name_hebrew}
        >
          {primarySite.site_name_hebrew}
        </p>
      </div>

      {/* Connection Details - Mapped for each connection */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 space-y-3">
        {siteGroup.map((site) => {
          const device = deviceMap.get(site.device_id);
          const pikud = device
            ? pikudMap.get(device.core_pikudim_site_id)
            : null;
          return (
            // Unique key for each connection in the list
            <div key={site.id}>
              <p>
                <strong>Device:</strong> {device?.hostname || "N/A"}
              </p>
              <p>
                <strong>Core Site:</strong> {pikud?.core_site_name || "N/A"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function EndSiteIndexPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const allSites = useSelector(selectAllSites);
  const allDevices = useSelector(selectAllDevices);
  const allPikudim = useSelector(selectAllPikudim);

  // Pre-process data into maps for efficient lookups (no change here)
  const deviceMap = useMemo(
    () => new Map(allDevices.map((d) => [d.id, d])),
    [allDevices]
  );
  const pikudMap = useMemo(
    () => new Map(allPikudim.map((p) => [p.id, p])),
    [allPikudim]
  );

  // --- NEW LOGIC: Group sites by their English name ---
  const groupedSites = useMemo(() => {
    return allSites.reduce((acc, site) => {
      const key = site.site_name_english;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(site);
      return acc;
    }, {});
  }, [allSites]);

  // --- UPDATED LOGIC: Filter the grouped sites ---
  const filteredSiteGroups = useMemo(() => {
    // Get an array of the site groups, e.g., [ [site1, site2], [site3, site4] ]
    const allGroups = Object.values(groupedSites);
    if (!searchTerm) {
      return allGroups;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return allGroups.filter((siteGroup) => {
      // Check the name from the first site in the group
      const representativeSite = siteGroup[0];
      return (
        representativeSite.site_name_english
          .toLowerCase()
          .includes(lowercasedFilter) ||
        representativeSite.site_name_hebrew.includes(lowercasedFilter)
      );
    });
  }, [groupedSites, searchTerm]);

  // --- UPDATED LOGIC: Navigate with the entire group's data ---
  const handleSiteClick = (siteGroup) => {
    // Use the site name as a more stable identifier for the group
    const navId = encodeURIComponent(siteGroup[0].site_name_english);
    // Pass the full array of site connections in the state
    navigate(`/sites/site/${navId}`, { state: { siteGroupData: siteGroup } });
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          All End-Sites
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
          Browse and search for a specific site to view its details.
        </p>
      </header>

      {/* Search Bar (no change here) */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by English or Hebrew name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-lg p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* --- UPDATED LOGIC: Grid now maps over the grouped sites --- */}
      {filteredSiteGroups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredSiteGroups.map((siteGroup) => (
            <SiteCard
              // The English name is now the unique key for the card
              key={siteGroup[0].site_name_english}
              siteGroup={siteGroup}
              deviceMap={deviceMap}
              pikudMap={pikudMap}
              onClick={() => handleSiteClick(siteGroup)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No sites found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
