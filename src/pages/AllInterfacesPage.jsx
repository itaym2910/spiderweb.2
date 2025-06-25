import React, { useState, useMemo } from "react";
import { useInterfaceData } from "./useInterfaceData"; // Assuming this hook provides all data
import { Button } from "../components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../components/ui/table";
import { Star, ArrowUp, ArrowDown, XCircle } from "lucide-react";

// Helper components (can be in this file or a separate one)
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

// Main Component
export default function AllInterfacesPage() {
  const { interfaces, handleToggleFavorite } = useInterfaceData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create a list of unique device names for the filter dropdown
  const uniqueDeviceNames = useMemo(() => {
    const names = new Set(interfaces.map((iface) => iface.deviceName));
    return ["all", ...Array.from(names).sort()];
  }, [interfaces]);
  const [deviceFilter, setDeviceFilter] = useState("all");

  const filteredInterfaces = useMemo(() => {
    return interfaces.filter((iface) => {
      // Status Filter
      if (statusFilter !== "all" && iface.status !== statusFilter) {
        return false;
      }
      // Device Filter
      if (deviceFilter !== "all" && iface.deviceName !== deviceFilter) {
        return false;
      }
      // Search Term Filter (checks interface name, description, and device name)
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

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          All Network Interfaces
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
          Search, filter, and manage all interfaces across the network.
        </p>
      </header>

      {/* --- Filter & Search Bar --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {/* Search Input */}
        <div className="md:col-span-1">
          <label
            htmlFor="search-interfaces"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Search
          </label>
          <input
            id="search-interfaces"
            type="text"
            placeholder="Search by name, device..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Device Filter */}
        <div>
          <label
            htmlFor="device-filter"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Device
          </label>
          <select
            id="device-filter"
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          >
            {uniqueDeviceNames.map((name) => (
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
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Up">Up</option>
            <option value="Down">Down</option>
            <option value="Admin Down">Admin Down</option>
          </select>
        </div>
      </div>

      {/* --- Interfaces Table --- */}
      <div className="flex-grow overflow-auto border dark:border-gray-700 rounded-lg">
        <Table>
          <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-700">
            <TableRow>
              <TableHead>Interface</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Traffic (In / Out)</TableHead>
              <TableHead>Errors (In / Out)</TableHead>
              <TableHead className="text-right">Favorite</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInterfaces.length > 0 ? (
              filteredInterfaces.map((iface) => (
                <TableRow key={iface.id}>
                  <TableCell>
                    <div className="font-medium">{iface.interfaceName}</div>
                    <div className="text-sm text-gray-500">
                      {iface.description}
                    </div>
                  </TableCell>
                  <TableCell>{iface.deviceName}</TableCell>
                  <TableCell>
                    <StatusIndicator status={iface.status} />
                  </TableCell>
                  <TableCell>{`${iface.trafficIn} / ${iface.trafficOut}`}</TableCell>
                  <TableCell
                    className={
                      iface.errors.in > 0 || iface.errors.out > 0
                        ? "font-bold text-orange-600 dark:text-orange-400"
                        : ""
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-gray-500"
                >
                  No interfaces match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
