import React, { useState, useMemo, useCallback } from "react";
import { useInterfaceData } from "../useInterfaceData";
import { Button } from "../../components/ui/button";
import { Search, X, RotateCcw } from "lucide-react";
import { useSelector } from "react-redux";

// Import extracted reusable components
import { VirtualizedTable } from "../../components/ui/VirtualizedTable";
import { ErrorMessage } from "../../components/ui/feedback/ErrorMessage";
import { StatusIndicator } from "../../components/ui/StatusIndicator";
import { FavoriteButton } from "../../components/ui/FavoriteButton";

export default function AllInterfacesPage() {
  const { interfaces, handleToggleFavorite, deviceFilterOptions, siteCount, linkCount } =
    useInterfaceData();

  const sitesStatus = useSelector((state) => state.sites.status);
  const linksStatus = useSelector((state) => state.tenGigLinks.status);

  const isLoading = sitesStatus === "loading" || linksStatus === "loading";
  const hasError = sitesStatus === "failed" || linksStatus === "failed";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");

  const hasActiveFilters =
    searchTerm !== "" || statusFilter !== "all" || deviceFilter !== "all";

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setDeviceFilter("all");
  }, []);

  const filteredInterfaces = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return interfaces.filter((iface) => {
      // 1. Status Filter
      if (statusFilter !== "all" && iface.status !== statusFilter) return false;

      // 2. Device Filter (exact hostname or trunk token match)
      if (deviceFilter !== "all") {
        const devices = (iface.deviceName || "")
          .split("<->")
          .map((d) => d.trim());
        if (!devices.includes(deviceFilter)) return false;
      }

      // 3. Keyword Search (null-safe)
      if (term) {
        const interfaceMatch =
          iface.interfaceName?.toLowerCase().includes(term) ?? false;
        const descMatch =
          iface.description?.toLowerCase().includes(term) ?? false;
        const deviceMatch =
          iface.deviceName?.toLowerCase().includes(term) ?? false;

        return interfaceMatch || descMatch || deviceMatch;
      }

      return true;
    });
  }, [interfaces, searchTerm, statusFilter, deviceFilter]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "interface",
        header: "Interface",
        size: 3,
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-100">
              {row.interfaceName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {row.description}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "device",
        header: "Device(s)",
        size: 2,
        cell: ({ row }) => (
          <span className="text-gray-600 dark:text-gray-300">
            {row.deviceName}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 1.5,
        cell: ({ row }) => <StatusIndicator status={row.status} />,
      },
      {
        accessorKey: "traffic",
        header: "Traffic (In/Out)",
        size: 1.5,
        cell: ({ row }) => (
          <span className="text-gray-600 dark:text-gray-300">
            {`${row.trafficIn} / ${row.trafficOut}`}
          </span>
        ),
      },
      {
        accessorKey: "errors",
        header: "Errors (In/Out)",
        align: "center",
        size: 1.5,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span
              className={
                row.errors.in > 0 || row.errors.out > 0
                  ? "font-bold text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-300"
              }
            >
              {`${row.errors.in} / ${row.errors.out}`}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "favorite",
        header: "Favorite",
        align: "center",
        size: 1,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <FavoriteButton
              id={row.id}
              isFavorite={row.isFavorite}
              onClick={handleToggleFavorite}
            />
          </div>
        ),
      },
    ],
    [handleToggleFavorite]
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 h-full flex flex-col gap-6 overflow-hidden">
      <header className="flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            All Network Interfaces
          </h1>
          <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
            Search, filter, and manage all interfaces across the network.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border dark:border-gray-700 shadow-sm">
            Showing{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {filteredInterfaces.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {interfaces.length}
            </span>{" "}
            interfaces
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border dark:border-gray-700 shadow-sm flex items-center gap-2">
            <span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{siteCount}</span> Sites
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">{linkCount}</span> Trunk Links
            </span>
          </div>
        </div>
      </header>

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Keyword Search */}
          <div>
            <label
              htmlFor="search-interfaces"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Search by Keyword
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="search-interfaces"
                type="text"
                placeholder="Name, device, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Clear search input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Device Filter */}
          <div>
            <label
              htmlFor="device-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by Device
            </label>
            <select
              id="device-filter"
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {deviceFilterOptions.map((name) => (
                <option key={name} value={name}>
                  {name === "all" ? "All Devices" : name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Up">Up</option>
              <option value="Down">Down</option>
              <option value="Admin Down">Admin Down</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md flex-1 min-h-0 flex flex-col overflow-hidden">
        <VirtualizedTable
          data={filteredInterfaces}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={
            hasError ? (
              <ErrorMessage />
            ) : (
              <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <Search
                  size={56}
                  className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
                />
                <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                  No Interfaces Found
                </p>
                <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
                  Your search or filters did not match any interfaces.
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="mt-4 gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Filters
                  </Button>
                )}
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
