// src/SearchPage.js
import React, { useState, useEffect } from "react";
import { MdSearch } from "react-icons/md"; // Optional: for an icon in the input or button

// Mock data - in a real app, this would come from an API
const allItems = [
  { id: 1, type: "User", name: "Alice Wonderland", email: "alice@example.com" },
  { id: 2, type: "User", name: "Bob The Builder", email: "bob@example.com" },
  { id: 3, type: "Document", title: "Project Alpha Report", category: "Reports" },
  { id: 4, type: "Document", title: "Quarterly Financials", category: "Finance" },
  { id: 5, type: "Task", description: "Update user dashboard", status: "In Progress" },
  { id: 6, type: "Setting", name: "Notification Preferences", section: "User Profile" },
  { id: 7, type: "User", name: "Charlie Brown", email: "charlie@example.com" },
  { id: 8, type: "Document", title: "Marketing Plan Q3", category: "Marketing" },
];

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // To know if a search has been performed

  const handleSearch = (e) => {
    if (e) e.preventDefault(); // Prevent form submission if it's an event
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(true); // A search was attempted (for an empty query)
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    // Simulate API call / filtering
    setTimeout(() => {
      const queryLower = searchQuery.toLowerCase();
      const filteredResults = allItems.filter((item) => {
        if (item.name && item.name.toLowerCase().includes(queryLower)) return true;
        if (item.email && item.email.toLowerCase().includes(queryLower)) return true;
        if (item.title && item.title.toLowerCase().includes(queryLower)) return true;
        if (item.description && item.description.toLowerCase().includes(queryLower)) return true;
        if (item.category && item.category.toLowerCase().includes(queryLower)) return true;
        if (item.section && item.section.toLowerCase().includes(queryLower)) return true;
        return false;
      });
      setSearchResults(filteredResults);
      setIsLoading(false);
    }, 1000); // Simulate network delay
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow min-h-full">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
        Search
      </h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for users, documents, settings..."
            className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            aria-label="Search query"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <MdSearch size={20} />
            )}
            <span>{isLoading ? "Searching..." : "Search"}</span>
          </button>
        </div>
      </form>

      {/* Results Section */}
      <div>
        {isLoading && (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            Loading results...
          </div>
        )}

        {!isLoading && hasSearched && searchResults.length === 0 && (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            No results found for "<strong>{searchQuery}</strong>". Try a different term.
          </div>
        )}

        {!isLoading && searchResults.length > 0 && (
          <div>
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">
              Search Results ({searchResults.length})
            </h2>
            <ul className="space-y-4">
              {searchResults.map((item) => (
                <li
                  key={item.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {item.name || item.title || `Item ${item.id}`}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Type: {item.type}
                  </p>
                  {item.email && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Email: {item.email}
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
                  {item.section && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Section: {item.section}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
         {!isLoading && !hasSearched && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <MdSearch size={48} className="mx-auto mb-2" />
            Enter a term above to start searching.
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;