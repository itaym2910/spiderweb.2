// src/pages/FavoritesPage.jsx

import React, { useMemo } from "react";
import { useInterfaceData } from "./useInterfaceData"; // The shared "brain"
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

// --- Reusable Helper Components (No changes needed, styles are consistent) ---

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
export default function FavoritesPage() {
  const { interfaces, handleToggleFavorite } = useInterfaceData();

  const favoriteInterfaces = useMemo(() => {
    return interfaces.filter((iface) => iface.isFavorite);
  }, [interfaces]);

  const renderContent = () => {
    if (favoriteInterfaces.length > 0) {
      return (
        <div className="overflow-x-auto border dark:border-gray-700/50 rounded-lg">
          <Table>
            <TableHeader className="bg-gray-100/50 dark:bg-gray-800/50">
              <TableRow>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                  Interface / Link
                </TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                  Device(s)
                </TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                  Traffic (In / Out)
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-600 dark:text-gray-300">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {favoriteInterfaces.map((iface) => (
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
    // Enhanced "Empty State"
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <Star
          size={56}
          className="mx-auto text-yellow-400 dark:text-yellow-500 mb-4"
        />
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
          No Favorite Connections Yet
        </p>
        <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
          Click the star icon on any interface in the "All Interfaces" page to
          add it here.
        </p>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Favorite Connections
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
          A quick overview of your most important network links and connections.
        </p>
      </header>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
        {renderContent()}
      </div>
    </div>
  );
}
