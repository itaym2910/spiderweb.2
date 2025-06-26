import React, { useState, useMemo } from "react";
import { useInterfaceData } from "./useInterfaceData"; // Hook provides data and filter options
import { Button } from "../components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../components/ui/table";
import { Star, ArrowUp, ArrowDown, XCircle, Search } from "lucide-react";

// Helper components remain unchanged, styles are good.
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

// --- STYLES UPDATED ---
export default function AllInterfacesPage() {
  const { interfaces, handleToggleFavorite, deviceFilterOptions } =
    useInterfaceData();

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

  const renderContent = () => {
    if (filteredInterfaces.length > 0) {
      return (
        <div className="overflow-x-auto border dark:border-gray-700/50 rounded-lg">
          <Table>
            <TableHeader className="bg-gray-100/50 dark:bg-gray-800/50">
              <TableRow>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                  Interface
                </TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                  Device
                </TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                  Traffic (In / Out)
                </TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                  Errors (In / Out)
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-600 dark:text-gray-300">
                  Favorite
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterfaces.map((iface) => (
                <TableRow
                  key={iface.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <TableCell>
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                      {iface.interfaceName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {iface.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {iface.deviceName}
                  </TableCell>
                  <TableCell>
                    <StatusIndicator status={iface.status} />
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{`${iface.trafficIn} / ${iface.trafficOut}`}</TableCell>
                  <TableCell
                    className={
                      iface.errors.in > 0 || iface.errors.out > 0
                        ? "font-bold text-orange-600 dark:text-orange-400"
                        : "text-gray-600 dark:text-gray-300"
                    }
                  >
                    {`${iface.errors.in} / ${iface.errors.out}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <FavoriteButton
                      isFavorite={iface.isFavorite}
                      onClick={() => handleToggleFavorite(iface.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    // Enhanced "No Results" state
    return (
      <div className="text-center py-16 px-4 mt-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <Search
          size={56}
          className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
        />
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
          No Interfaces Found
        </p>
        <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
          Your search or filters did not match any interfaces. Try adjusting
          your criteria.
        </p>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          All Network Interfaces
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
          Search, filter, and manage all interfaces across the network.
        </p>
      </header>

      {/* Filter & Search Bar Card */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Main Content Area */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
        {renderContent()}
      </div>
    </div>
  );
}
