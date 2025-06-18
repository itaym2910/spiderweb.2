// src/SearchPage.js
import React, { useState, useEffect } from "react";
import { MdSearch } from "react-icons/md";

// Mock data (assuming it's the same as the previous version)
const allItems = [
  {
    id: 9,
    type: "Core Device",
    name: "Router-NYC-01",
    model: "ASR9K",
    location: "New York DC",
    ipAddress: "10.1.1.1",
  },
  {
    id: 10,
    type: "Core Device",
    name: "Switch-LDN-CORE-A",
    model: "NCS5500",
    location: "London Core",
    ipAddress: "10.2.2.1",
  },
  {
    id: 15,
    type: "Core Device",
    name: "Firewall-Global-Edge",
    model: "ASA5525",
    location: "DMZ",
    ipAddress: "192.168.100.1",
  },
  {
    id: 11,
    type: "Site",
    name: "Headquarters",
    address: "123 Main St, Anytown",
    country: "USA",
    siteId: "HQ-001",
  },
  {
    id: 12,
    type: "Site",
    name: "Branch Office Paris",
    address: "1 Rue de la Paix, Paris",
    country: "France",
    siteId: "PAR-BR-002",
  },
  {
    id: 13,
    type: "Link",
    name: "NYC-LDN-Primary",
    source: "Router-NYC-01",
    target: "Router-LDN-01",
    bandwidth: "100G",
    linkId: "LNK-NYC-LDN-001",
  },
  {
    id: 14,
    type: "Link",
    name: "HQ-Backbone-A",
    source: "HQ-Switch-01",
    target: "Backbone-Router-A",
    status: "Up",
    linkId: "LNK-HQ-BB-007",
  },
  {
    id: 3,
    type: "Document",
    title: "Project Alpha Report",
    category: "Reports",
  },
  {
    id: 4,
    type: "Document",
    title: "Quarterly Financials",
    category: "Finance",
  },
  {
    id: 8,
    type: "Document",
    title: "Marketing Plan Q3",
    category: "Marketing",
  },
  {
    id: 5,
    type: "Task",
    description: "Update core device Router-NYC-01 firmware",
    status: "In Progress",
  },
];

const itemTypes = [
  "All Types",
  "Core Device",
  "Site",
  "Link",
  "Document",
  "Task",
];

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(itemTypes[0]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    // ... (handleSearch logic remains the same)
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
        if (selectedType !== "All Types" && item.type !== selectedType) {
          return false;
        }

        if (searchQuery.trim()) {
          if (item.name && item.name.toLowerCase().includes(queryLower))
            return true;
          if (item.title && item.title.toLowerCase().includes(queryLower))
            return true;
          if (
            item.description &&
            item.description.toLowerCase().includes(queryLower)
          )
            return true;
          if (item.category && item.category.toLowerCase().includes(queryLower))
            return true;
          if (
            item.ipAddress &&
            item.ipAddress.toLowerCase().includes(queryLower)
          )
            return true;
          if (item.siteId && item.siteId.toLowerCase().includes(queryLower))
            return true;
          if (item.linkId && item.linkId.toLowerCase().includes(queryLower))
            return true;
          if (item.model && item.model.toLowerCase().includes(queryLower))
            return true;
          if (item.location && item.location.toLowerCase().includes(queryLower))
            return true;
          if (item.address && item.address.toLowerCase().includes(queryLower))
            return true;
          if (item.country && item.country.toLowerCase().includes(queryLower))
            return true;
          if (item.source && item.source.toLowerCase().includes(queryLower))
            return true;
          if (item.target && item.target.toLowerCase().includes(queryLower))
            return true;
          if (item.status && item.status.toLowerCase().includes(queryLower))
            return true;
          return false;
        }
        return true;
      });
      setSearchResults(filteredResults);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (hasSearched || searchQuery.trim()) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow min-h-full flex flex-col">
      <form onSubmit={handleSearch} className="mb-6">
        {/* Outer container to control the width of the input group */}
        <div className="w-full md:w-1/3">
          {" "}
          {/* <<< KEY CHANGE: Width control */}
          <div className="space-y-4">
            {/* Type Filter Dropdown */}
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
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Filter by item type"
              >
                {itemTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div>
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
                placeholder="Enter search term..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                aria-label="Search query"
              />
            </div>
          </div>
        </div>{" "}
        {/* End of width control div */}
        <button
          type="submit"
          disabled={isLoading}
          // Adjust button to align with the narrower input fields or remain full width based on design
          // Option 1: Align with inputs (might look odd if inputs are very narrow)
          // className="mt-6 w-full md:w-1/3 px-6 py-3 ..."
          // Option 2: Keep button wider or contextually placed (current style is fine for now)
          className="mt-6 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
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
          ) : (
            <MdSearch size={20} />
          )}
          <span>{isLoading ? "Searching..." : "Search"}</span>
        </button>
      </form>

      {/* Results Section (remains the same) */}
      <div className="flex-grow overflow-y-auto">
        {/* ... loading, no results, results list ... */}
        {isLoading && (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            {" "}
            Loading results...{" "}
          </div>
        )}
        {!isLoading && hasSearched && searchResults.length === 0 && (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            {" "}
            No results found for "<strong>{searchQuery}</strong>"{" "}
            {selectedType !== "All Types" &&
              ` of type "<strong>${selectedType}</strong>"`}
            . Try different terms or filters.{" "}
          </div>
        )}
        {!isLoading && searchResults.length > 0 && (
          <div>
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">
              {" "}
              Search Results ({searchResults.length}){" "}
            </h2>
            <ul className="space-y-4">
              {searchResults.map((item) => (
                <li
                  key={item.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {" "}
                    {item.name || item.title || `Item ${item.id}`}{" "}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {" "}
                    Type: {item.type}{" "}
                  </p>
                  {item.type === "Core Device" && item.ipAddress && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      IP Address: {item.ipAddress}
                    </p>
                  )}
                  {item.type === "Site" && item.siteId && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Site ID: {item.siteId}
                    </p>
                  )}
                  {item.type === "Link" && item.linkId && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Link ID: {item.linkId}
                    </p>
                  )}
                  {item.model && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Model: {item.model}
                    </p>
                  )}
                  {item.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Location: {item.location}
                    </p>
                  )}
                  {item.address && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Address: {item.address}
                    </p>
                  )}
                  {item.country && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Country: {item.country}
                    </p>
                  )}
                  {item.category && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Category: {item.category}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Description: {item.description}
                    </p>
                  )}
                  {item.status && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Status: {item.status}
                    </p>
                  )}
                  {item.source && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Source: {item.source}
                    </p>
                  )}
                  {item.target && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Target: {item.target}
                    </p>
                  )}
                  {item.bandwidth && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Bandwidth: {item.bandwidth}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {!isLoading && !hasSearched && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            {" "}
            <MdSearch size={48} className="mx-auto mb-2" /> Enter a term or
            select a type to start searching.{" "}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
