import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// NEW: Import createSelector
import { createSelector } from "@reduxjs/toolkit";
import { fetchInitialData } from "../../redux/slices/authSlice";
import { startConnecting } from "../../redux/slices/realtimeSlice";
import { Loader2, AlertTriangle } from "lucide-react";

// --- THE FIX ---
// 1. Define the "input selectors" that grab the raw data.
const selectPikudimStatus = (state) => state.corePikudim.status;
const selectDevicesStatus = (state) => state.devices.status;
const selectLinksStatus = (state) => state.tenGigLinks.status;
const selectSitesStatus = (state) => state.sites.status;

// 2. Use createSelector to combine them.
// This selector will only return a new object if one of the input status strings changes.
const selectCoreDataStatus = createSelector(
  [
    selectPikudimStatus,
    selectDevicesStatus,
    selectLinksStatus,
    selectSitesStatus,
  ],
  (pikudim, devices, links, sites) => ({
    pikudim,
    devices,
    links,
    sites,
  })
);
// --- END FIX ---

export function AppInitializer({ children }) {
  const dispatch = useDispatch();
  // This now uses the memoized selector
  const dataStatus = useSelector(selectCoreDataStatus);

  const isIdle = Object.values(dataStatus).every((s) => s === "idle");
  const isSuccessful = Object.values(dataStatus).every(
    (s) => s === "succeeded"
  );
  const isLoading = Object.values(dataStatus).some((s) => s === "loading");
  const hasFailed = Object.values(dataStatus).some((s) => s === "failed");

  useEffect(() => {
    if (isIdle) {
      dispatch(fetchInitialData());
    }

    if (isSuccessful) {
      dispatch(startConnecting());
    }
  }, [isIdle, isSuccessful, dispatch]);

  const handleRetry = () => {
    dispatch(fetchInitialData());
  };

  // The rest of the component's rendering logic remains the same.
  if (isLoading || isIdle) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4">
            Initializing Spiderweb
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching network topology and status...
          </p>
        </div>
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <AlertTriangle className="h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-4">
            Failed to Load Application Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            An error occurred while fetching critical network information.
            Please check your connection and try again.
          </p>
          <button
            onClick={handleRetry}
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return children;
}
