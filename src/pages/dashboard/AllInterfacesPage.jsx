import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useInterfaceData } from "../useInterfaceData";
import { Button } from "../../components/ui/button";
import { Search, X, RotateCcw, ChevronDown, Check } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTenGigLinks, selectTenGigLinksHasMore, selectAllTenGigLinks, selectTenGigLinksPaginationStatus } from "../../redux/slices/tenGigLinksSlice";

// Import extracted reusable components
import { VirtualizedTable } from "../../components/ui/VirtualizedTable";
import { ErrorMessage } from "../../components/ui/feedback/ErrorMessage";
import { StatusIndicator } from "../../components/ui/StatusIndicator";
import { FavoriteButton } from "../../components/ui/FavoriteButton";
import LinkDetailPopup from "../../components/shared/LinkDetailPopup";

export default function AllInterfacesPage({ theme }) {
  const dispatch = useDispatch();
  const { interfaces, handleToggleFavorite, deviceFilterOptions } =
    useInterfaceData();

  const sitesStatus = useSelector((state) => state.sites.status);
  const linksStatus = useSelector((state) => state.tenGigLinks.status);
  
  const hasMoreLinks = useSelector(selectTenGigLinksHasMore);
  const allTenGigLinks = useSelector(selectAllTenGigLinks);
  const paginationStatus = useSelector(selectTenGigLinksPaginationStatus);

  const isLoading = sitesStatus === "loading" || linksStatus === "loading";
  const isFetchingMore = paginationStatus === "loading";
  const hasError = sitesStatus === "failed" || linksStatus === "failed";
  const [popupItem, setPopupItem] = useState(null);
  const handleClosePopup = useCallback(() => setPopupItem(null), []);

  // Use a ref to prevent multiple simultaneous fetches - this avoids
  // stale-closure issues that useCallback + Redux status can cause
  const isFetchingRef = useRef(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [deviceSearchTerm, setDeviceSearchTerm] = useState("");
  const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false);

  const deviceDropdownRef = useRef(null);
  const deviceSearchInputRef = useRef(null);

  // Close device dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deviceDropdownRef.current && !deviceDropdownRef.current.contains(event.target)) {
        setIsDeviceDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isDeviceDropdownOpen) {
        setIsDeviceDropdownOpen(false);
      }
    };

    if (isDeviceDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      if (deviceSearchInputRef.current) {
        setTimeout(() => deviceSearchInputRef.current?.focus(), 50);
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeviceDropdownOpen]);

  const selectedDeviceLabel = useMemo(() => {
    if (deviceFilter === "all") return "All Devices";
    const found = deviceFilterOptions.find((opt) => String(opt.id) === String(deviceFilter));
    return found ? found.label : "All Devices";
  }, [deviceFilter, deviceFilterOptions]);

  const filteredDevices = useMemo(() => {
    const list = deviceFilterOptions.filter((opt) => opt.id !== "all");
    if (!deviceSearchTerm.trim()) return list;

    const words = deviceSearchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return list.filter((opt) => {
      const labelLower = opt.label.toLowerCase();
      return words.every((word) => labelLower.includes(word));
    });
  }, [deviceFilterOptions, deviceSearchTerm]);

  // Format today's date in local YYYY-MM-DD
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const handleStartDateChange = useCallback(
    (e) => {
      const val = e.target.value;
      if (!val) {
        setStartDate("");
        return;
      }
      // 2. Start date cannot be after current date
      if (val > today) {
        return;
      }
      // 1. If start date is set after current end date, clear end date so it is never before start date
      if (endDate && val > endDate) {
        setEndDate("");
      }
      setStartDate(val);
    },
    [today, endDate]
  );

  const handleEndDateChange = useCallback(
    (e) => {
      const val = e.target.value;
      if (!val) {
        setEndDate("");
        return;
      }
      // 1. End date cannot be before start date
      if (startDate && val < startDate) {
        return;
      }
      setEndDate(val);
    },
    [startDate]
  );

  const loadMore = useCallback(() => {
    if (isFetchingRef.current || !hasMoreLinks) return;
    isFetchingRef.current = true;
    const skip = allTenGigLinks.length;
    const coredevice_id = deviceFilter !== "all" ? parseInt(deviceFilter, 10) : null;
    dispatch(fetchTenGigLinks({ 
      skip, 
      limit: 20, 
      coredevice_id,
      start_date: startDate || null,
      end_date: endDate || null
    }))
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [dispatch, hasMoreLinks, allTenGigLinks.length, deviceFilter, startDate, endDate]);

  const hasActiveFilters =
    searchTerm !== "" || statusFilter !== "all" || deviceFilter !== "all" || startDate !== "" || endDate !== "";

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setDeviceFilter("all");
    setDeviceSearchTerm("");
    setIsDeviceDropdownOpen(false);
    setStartDate("");
    setEndDate("");
  }, []);

  // Fetch when backend filters change
  const isFirstRender = useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Skip initial mount since authSlice fetches it
    }
    const coredevice_id = deviceFilter !== "all" ? parseInt(deviceFilter, 10) : null;
    dispatch(fetchTenGigLinks({ 
      skip: 0, 
      limit: 20, 
      coredevice_id,
      start_date: startDate || null,
      end_date: endDate || null
    }));
  }, [deviceFilter, startDate, endDate, dispatch]);

  const filteredInterfaces = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return interfaces.filter((iface) => {
      // 1. Status Filter
      if (statusFilter !== "all" && iface.status !== statusFilter) return false;

      // 2. Keyword Search (match by word)
      if (term) {
        const queryWords = term.split(/\s+/).filter(Boolean);
        const searchableText = [
          iface.interfaceName,
          iface.description,
          iface.deviceName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return queryWords.every((word) => searchableText.includes(word));
      }

      return true;
    });
  }, [interfaces, searchTerm, statusFilter]);

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
        cell: ({ row }) => <StatusIndicator status={row.status} size="lg" />,
      },
      {
        accessorKey: "traffic",
        header: "Traffic (In/Out)",
        size: 1.5,
          cell: ({ row }) => {
            const inVal = row.trafficIn && String(row.trafficIn).trim() !== "" && row.trafficIn !== "N/A" ? row.trafficIn : "NA";
            const outVal = row.trafficOut && String(row.trafficOut).trim() !== "" && row.trafficOut !== "N/A" ? row.trafficOut : "NA";
            return (
              <span className="text-gray-600 dark:text-gray-300">
                {`${inVal}/${outVal}`}
              </span>
            );
          },
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
      </header>

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

          {/* Device Filter (Searchable Combobox) */}
          <div className="relative" ref={deviceDropdownRef}>
            <label
              id="device-filter-label"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by Device
            </label>
            <button
              id="device-filter-trigger"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isDeviceDropdownOpen}
              aria-labelledby="device-filter-label device-filter-trigger"
              onClick={() => setIsDeviceDropdownOpen((prev) => !prev)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors cursor-pointer"
            >
              <span className="truncate">{selectedDeviceLabel}</span>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {deviceFilter !== "all" && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeviceFilter("all");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        setDeviceFilter("all");
                      }
                    }}
                    className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded cursor-pointer"
                    title="Clear device filter"
                    aria-label="Clear device filter"
                  >
                    <X className="h-4 w-4" />
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isDeviceDropdownOpen ? "rotate-180 text-blue-500" : ""
                  }`}
                />
              </div>
            </button>

            {/* Dropdown Panel */}
            {isDeviceDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
                {/* Search input inside dropdown */}
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      ref={deviceSearchInputRef}
                      type="text"
                      placeholder="Search devices..."
                      value={deviceSearchTerm}
                      onChange={(e) => setDeviceSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {deviceSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setDeviceSearchTerm("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Clear device search"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Device List */}
                <div
                  role="listbox"
                  className="max-h-60 overflow-y-auto p-1 divide-y divide-gray-100 dark:divide-gray-700/40 text-xs"
                >
                  {/* All Devices option */}
                  {(!deviceSearchTerm || "all devices".includes(deviceSearchTerm.toLowerCase())) && (
                    <button
                      type="button"
                      role="option"
                      aria-selected={deviceFilter === "all"}
                      onClick={() => {
                        setDeviceFilter("all");
                        setIsDeviceDropdownOpen(false);
                        setDeviceSearchTerm("");
                      }}
                      className={`w-full px-3 py-2 text-left rounded-md flex items-center justify-between transition-colors ${
                        deviceFilter === "all"
                          ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-semibold"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span>All Devices</span>
                      {deviceFilter === "all" && (
                        <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  )}

                  {/* Filtered devices */}
                  {filteredDevices.map((opt) => {
                    const isSelected = String(deviceFilter) === String(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setDeviceFilter(String(opt.id));
                          setIsDeviceDropdownOpen(false);
                          setDeviceSearchTerm("");
                        }}
                        className={`w-full px-3 py-2 text-left rounded-md flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-semibold"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}

                  {/* Empty state when no device matches search */}
                  {filteredDevices.length === 0 &&
                    deviceSearchTerm &&
                    !"all devices".includes(deviceSearchTerm.toLowerCase()) && (
                      <div className="py-4 px-3 text-center text-gray-500 dark:text-gray-400">
                        <p className="text-xs">No devices matching "{deviceSearchTerm}"</p>
                        <button
                          type="button"
                          onClick={() => setDeviceSearchTerm("")}
                          className="mt-1 text-xs text-blue-500 hover:underline"
                        >
                          Clear search
                        </button>
                      </div>
                    )}
                </div>
              </div>
            )}
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

          {/* Start Date Filter */}
          <div>
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              max={today}
              value={startDate}
              onChange={handleStartDateChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={handleEndDateChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md flex-1 min-h-0 flex flex-col overflow-hidden">
        <VirtualizedTable
          data={filteredInterfaces}
          columns={columns}
          isLoading={isLoading}
          hasMore={hasMoreLinks}
          isFetchingMore={isFetchingMore}
          onScrollEnd={loadMore}
          onRowClick={(row) => setPopupItem({ data: row.raw, type: "link", title: row.interfaceName })}
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

      <LinkDetailPopup
        linkData={popupItem?.data || null}
        linkType={popupItem?.type || "link"}
        linkTitle={popupItem?.title || ""}
        onClose={handleClosePopup}
        theme={theme}
      />
    </div>
  );
}
