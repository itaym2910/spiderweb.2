import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAllSites } from "../../redux/slices/sitesSlice";
import { selectAllDevices } from "../../redux/slices/devicesSlice";
import { selectAllPikudim } from "../../redux/slices/corePikudimSlice";

// A single card component for a site
const SiteCard = ({ site, device, pikud, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-transparent dark:hover:border-blue-500 hover:border-blue-400"
  >
    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 truncate">
      {site.site_name_english}
    </h3>
    <p
      className="text-sm text-gray-500 dark:text-gray-400 truncate"
      title={site.site_name_hebrew}
    >
      {site.site_name_hebrew}
    </p>
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
      <p>
        <strong>Device:</strong> {device?.hostname || "N/A"}
      </p>
      <p>
        <strong>Core Site:</strong> {pikud?.core_site_name || "N/A"}
      </p>
    </div>
  </div>
);

export default function EndSiteIndexPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all necessary data from Redux
  const allSites = useSelector(selectAllSites);
  const allDevices = useSelector(selectAllDevices);
  const allPikudim = useSelector(selectAllPikudim);

  // Pre-process data into maps for efficient lookups
  const deviceMap = useMemo(
    () => new Map(allDevices.map((d) => [d.id, d])),
    [allDevices]
  );
  const pikudMap = useMemo(
    () => new Map(allPikudim.map((p) => [p.id, p])),
    [allPikudim]
  );

  // Filter sites based on the search term
  const filteredSites = useMemo(() => {
    if (!searchTerm) {
      return allSites;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return allSites.filter(
      (site) =>
        site.site_name_english.toLowerCase().includes(lowercasedFilter) ||
        site.site_name_hebrew.includes(lowercasedFilter)
    );
  }, [allSites, searchTerm]);

  // Handler to navigate when a card is clicked
  const handleSiteClick = (site) => {
    const navId = `site-${site.id}`;
    // Pass the full site object in the location state
    navigate(`/sites/site/${navId}`, { state: { siteData: site } });
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

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by English or Hebrew name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-lg p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Grid of Site Cards */}
      {filteredSites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredSites.map((site) => {
            const device = deviceMap.get(site.device_id);
            const pikud = device
              ? pikudMap.get(device.core_pikudim_site_id)
              : null;
            return (
              <SiteCard
                key={site.id}
                site={site}
                device={device}
                pikud={pikud}
                onClick={() => handleSiteClick(site)}
              />
            );
          })}
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
