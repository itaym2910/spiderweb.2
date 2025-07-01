// src/components/auth/AppInitializer.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInitialData } from "../../redux/slices/authSlice"; // The "master" thunk
import { Loader2 } from "lucide-react"; // A nice loading icon

// Helper to check the status of all core data slices
const selectCoreDataStatus = (state) => ({
  pikudim: state.corePikudim.status,
  devices: state.devices.status,
  links: state.tenGigLinks.status,
  sites: state.sites.status,
});

export function AppInitializer({ children }) {
  const dispatch = useDispatch();

  // We check the status of all key data slices
  const dataStatus = useSelector(selectCoreDataStatus);

  // Determine the combined status
  const isIdle = Object.values(dataStatus).every((s) => s === "idle");
  const isLoading = Object.values(dataStatus).some((s) => s === "loading");
  const hasFailed = Object.values(dataStatus).some((s) => s === "failed");

  useEffect(() => {
    // If ANY of the core data slices are in the 'idle' state,
    // it means we haven't tried to fetch the data yet in this session.
    if (isIdle) {
      dispatch(fetchInitialData());
    }
  }, [isIdle, dispatch]);

  const handleRetry = () => {
    // Re-dispatch the master fetch thunk
    dispatch(fetchInitialData());
  };

  // --- 1. RENDER LOADING STATE ---
  // If any data slice is loading, show a full-screen spinner.
  // This prevents the main UI from trying to render with partial or no data.
  if (isLoading || isIdle) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Loading Network Data...
          </p>
        </div>
      </div>
    );
  }

  // --- 2. RENDER ERROR STATE ---
  // If any data slice failed to load, show a helpful error message.
  if (hasFailed) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            Failed to Load Application Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            An error occurred while fetching network information. Please check
            your connection and try again.
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- 3. RENDER SUCCESS STATE ---
  // Only when all data is successfully loaded, render the actual application.
  return children;
}
