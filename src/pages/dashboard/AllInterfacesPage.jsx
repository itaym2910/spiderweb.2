import React, { useState, useMemo } from "react";
import { useInterfaceData } from "../useInterfaceData";
import { Button } from "../../components/ui/button";
import { Star, ArrowUp, ArrowDown, XCircle, Search } from "lucide-react";
import { useSelector } from "react-redux";

// Import the virtualized table and feedback components
import { VirtualizedTable } from "../../components/ui/VirtualizedTable";
import { ErrorMessage } from "../../components/ui/feedback/ErrorMessage";

// Helper components (StatusIndicator, FavoriteButton) remain the same
const StatusIndicator = ({ status }) => {
  const config = {
    Up: { color: "text-green-500", Icon: ArrowUp, label: "Up" },
    Down: { color: "text-red-500", Icon: ArrowDown, label: "Down" },
    "Admin Down": {
      color: "text-gray-500",
      Icon: XCircle,
      label: "Admin Down",
    },
  }[status] || { color: "text-gray-500", Icon: XCircle, label: "Unknown" };
  return (
    <div className={`flex items-center gap-2 font-medium ${config.color}`}>
      <config.Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
};

const FavoriteButton = ({ isFavorite, onClick }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    aria-label={isFavorite ? "Unfavorite" : "Favorite"}
  >
    <Star
      className={`h-5 w-5 transition-colors ${
        isFavorite
          ? "text-yellow-500 fill-yellow-400"
          : "text-gray-400 hover:text-yellow-500"
      }`}
    />
  </Button>
);

export default function AllInterfacesPage() {
  const { interfaces, handleToggleFavorite, deviceFilterOptions } =
    useInterfaceData();

  const sitesStatus = useSelector((state) => state.sites.status);
  const linksStatus = useSelector((state) => state.tenGigLinks.status);

  const isLoading = sitesStatus === "loading" || linksStatus === "loading";
  const hasError = sitesStatus === "failed" || linksStatus === "failed";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");

  const filteredInterfaces = useMemo(() => {
    return interfaces.filter((iface) => {
      if (statusFilter !== "all" && iface.status !== statusFilter) return false;
      if (deviceFilter !== "all" && !iface.deviceName.includes(deviceFilter))
        return false;
      if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        return (
          iface.interfaceName.toLowerCase().includes(lowercasedTerm) ||
          iface.description.toLowerCase().includes(lowercasedTerm) ||
          iface.deviceName.toLowerCase().includes(lowercasedTerm)
        );
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
          <span className="text-gray-600 dark:text-gray-300">{`${row.trafficIn} / ${row.trafficOut}`}</span>
        ),
      },
      {
        accessorKey: "errors",
        header: "Errors (In/Out)",
        size: 1.5,
        cell: ({ row }) => (
          <span
            className={
              row.errors.in > 0 || row.errors.out > 0
                ? "font-bold text-orange-600 dark:text-orange-400"
                : "text-gray-600 dark:text-gray-300"
            }
          >
            {`${row.errors.in} / ${row.errors.out}`}
          </span>
        ),
      },
      {
        accessorKey: "favorite",
        header: "Favorite",
        size: 1,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <FavoriteButton
              isFavorite={row.isFavorite}
              onClick={() => handleToggleFavorite(row.id)}
            />
          </div>
        ),
      },
    ],
    [handleToggleFavorite]
  );

  const EmptyState = (
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
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 h-full flex flex-col gap-6">
      <header className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          All Network Interfaces
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
          Search, filter, and manage all interfaces across the network.
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter inputs... */}
          <div>
            <label
              htmlFor="search-interfaces"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Search by Keyword
            </label>
            <input
              id="search-interfaces"
              type="text"
              placeholder="Name, device, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
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

      {/* This container grows to fill the rest of the space, and its child will take up 100% of its height. */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md flex-grow min-h-0">
        <VirtualizedTable
          data={filteredInterfaces}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={hasError ? <ErrorMessage /> : EmptyState}
        />
      </div>
    </div>
  );
}
