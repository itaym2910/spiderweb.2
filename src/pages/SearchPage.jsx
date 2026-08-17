// src/SearchPage.js
import React, { useState, useEffect } from "react";
import {
  MdSearch,
  MdOutlineManageSearch,
  MdErrorOutline,
} from "react-icons/md";



import { useSelector } from "react-redux";
import { selectAllDevices } from "../redux/slices/devicesSlice";
import { selectAllSites } from "../redux/slices/sitesSlice";
import { selectAllTenGigLinks } from "../redux/slices/tenGigLinksSlice";

const itemTypes = [
  "All Types",
  "Core Device",
  "Site",
  "Link",
];

// --- NEW STYLED COMPONENT ---
const SearchResultCard = ({ item }) => {
  const renderDetail = (label, value) => {
    if (!value) return null;
    return (
      <p className="text-gray-600 dark:text-gray-400">
        <strong className="text-gray-700 dark:text-gray-300">{label}:</strong>{" "}
        {value}
      </p>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/50">
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 truncate">
          {item.name || item.title || `Item ${item.id}`}
        </h3>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          {item.type}
        </p>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm space-y-1">
        {renderDetail("Description", item.description)}
        {renderDetail("IP Address", item.ipAddress)}
        {renderDetail("Location / Site", item.location)}
        {renderDetail("Source Device", item.source)}
        {renderDetail("Target Device", item.target)}
        {renderDetail("Bandwidth", item.bandwidth)}
        {renderDetail("Status", item.status)}
      </div>
    </div>
  );
};

function SearchPage() {
  const devices = useSelector(selectAllDevices);
  const sites = useSelector(selectAllSites);
  const links = useSelector(selectAllTenGigLinks);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(itemTypes[0]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const allItems = React.useMemo(() => {
    const devItems = devices.map((d) => ({
      id: `dev-${d.id}`,
      type: "Core Device",
      name: d.hostname || d.name,
      ipAddress: d.ip_address || d.ip,
      description: `Core Device ID: ${d.id}`,
    }));

    const siteItems = sites.map((s) => ({
      id: `site-${s.id}`,
      type: "Site",
      name: s.site_name_english || s.name,
      description: s.Description || `Interface: ${s.interface_id}`,
      status: s.physicalStatus || "Up",
    }));

    const linkItems = links.map((l) => ({
      id: `link-${l.id}`,
      type: "Link",
      name: `Link ${l.source} <-> ${l.target}`,
      source: l.source,
      target: l.target,
      bandwidth: l.bandwidth || l.bw || "10G",
      status: l.status,
      description: l.Description || "Core Inter-Site Link",
    }));

    return [...devItems, ...siteItems, ...linkItems];
  }, [devices, sites, links]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() && selectedType === "All Types") {
      setSearchResults([]);
      setHasSearched(true);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    setTimeout(() => {
      const queryLower = searchQuery.toLowerCase();
      const filteredResults = allItems.filter((item) => {
        if (selectedType !== "All Types" && item.type !== selectedType)
          return false;
        if (searchQuery.trim()) {
          return Object.values(item).some((val) =>
            String(val).toLowerCase().includes(queryLower)
          );
        }
        return true;
      });
      setSearchResults(filteredResults);
      setIsLoading(false);
    }, 200);
  };

  useEffect(() => {
    if (hasSearched || searchQuery.trim()) {
      const timer = setTimeout(() => handleSearch(), 300); // Debounce search
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, searchQuery]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16 px-4">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mt-4">
            Searching...
          </p>
        </div>
      );
    }

    if (hasSearched && searchResults.length === 0) {
      return (
        <div className="text-center py-16 px-4 mt-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <MdErrorOutline
            size={56}
            className="mx-auto text-yellow-500 dark:text-yellow-400 mb-4"
          />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            No Results Found
          </p>
          <p className="text-md text-gray-500 dark:text-gray-500 mt-2 max-w-md mx-auto">
            Your search for "{searchQuery}" in "{selectedType}" did not return
            any matches. Please try a different query.
          </p>
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Results ({searchResults.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {searchResults.map((item) => (
              <SearchResultCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-16 px-4 mt-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <MdOutlineManageSearch
          size={56}
          className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
        />
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
          Start a Global Search
        </p>
        <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
          Use the filters above to find any entity in the system.
        </p>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Global Search
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
          Find devices, sites, links, and other assets across the entire system.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          {/* Search Input */}
          <div className="md:col-span-2 lg:col-span-2">
            <label
              htmlFor="searchQueryInput"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Search Term
            </label>
            <input
              id="searchQueryInput"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Router-NYC, 'Project Alpha', 10.1.1.1"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          {/* Type Filter */}
          <div>
            <label
              htmlFor="itemTypeSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by Type
            </label>
            <select
              id="itemTypeSelect"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {itemTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            <MdSearch size={20} />
            <span>{isLoading ? "..." : "Search"}</span>
          </button>
        </div>
      </form>

      <div className="mt-8">{renderContent()}</div>
    </div>
  );
}

export default SearchPage;
