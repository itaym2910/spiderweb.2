import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInitialData } from "../../redux/slices/authSlice";
import { Loader2, AlertTriangle } from "lucide-react";

// Helper to check the status of all core data slices
const selectCoreDataStatus = (state) => ({
  pikudim: state.corePikudim.status,
  devices: state.devices.status,
  links: state.tenGigLinks.status,
  sites: state.sites.status,
});

export function AppInitializer({ children }) {
  const dispatch = useDispatch();

  const dataStatus = useSelector(selectCoreDataStatus);

  // Determine the combined status
  const isIdle = Object.values(dataStatus).every((s) => s === "idle");
  const isLoading = Object.values(dataStatus).some((s) => s === "loading");
  const hasFailed = Object.values(dataStatus).some((s) => s === "failed");

  useEffect(() => {
    // If we haven't fetched data yet in this session, fetch it.
    if (isIdle) {
      dispatch(fetchInitialData());
    }
  }, [isIdle, dispatch]);

  const handleRetry = () => {
    dispatch(fetchInitialData());
  };

  // --- 1. RENDER GLOBAL LOADING STATE ---
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

  // --- 2. RENDER GLOBAL ERROR STATE ---
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

  // --- 3. RENDER SUCCESS STATE (The actual app) ---
  return children;
}
