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

// --- Reusable Helper Components (copied from AllInterfacesPage for consistency) ---

const StatusIndicator = ({ status }) => {
  const config = {
    Up: { color: "text-green-500", Icon: ArrowUp, label: "Up" },
    Down: { color: "text-red-500", Icon: ArrowDown, label: "Down" },
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

// --- Main Component ---

export default function FavoritesPage() {
  // 1. Get the unified list of all interfaces and the toggle function from the shared hook.
  const { interfaces, handleToggleFavorite } = useInterfaceData();

  // 2. Filter the unified list to get ONLY the favorited items.
  //    useMemo ensures this filtering only happens when the source data changes.
  const favoriteInterfaces = useMemo(() => {
    return interfaces.filter((iface) => iface.isFavorite);
  }, [interfaces]);

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Favorite Connections
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
          A quick overview of your most important network links and connections.
        </p>
      </header>

      {/* --- Favorites Table --- */}
      <div className="flex-grow overflow-auto border dark:border-gray-700 rounded-lg">
        <Table>
          <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-700">
            <TableRow>
              <TableHead>Interface / Link</TableHead>
              <TableHead>Device(s)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Traffic (In / Out)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 3. Render the filtered list or an empty state message */}
            {favoriteInterfaces.length > 0 ? (
              favoriteInterfaces.map((iface) => (
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
                  <TableCell className="text-right">
                    {/* The same toggle function works here to "unfavorite" */}
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
                  colSpan={5}
                  className="h-24 text-center text-gray-500"
                >
                  No favorite interfaces selected.
                  <br />
                  <span className="text-sm">
                    Click the star on any item in the "All Interfaces" tab to
                    add it here.
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
