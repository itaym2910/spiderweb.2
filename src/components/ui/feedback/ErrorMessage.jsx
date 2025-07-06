import React from "react";
import { AlertTriangle } from "lucide-react";

export const ErrorMessage = ({
  onRetry,
  message = "An error occurred while fetching data.",
}) => (
  <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
    <AlertTriangle className="h-12 w-12 text-red-500" />
    <p className="mt-4 text-lg font-semibold text-red-600 dark:text-red-400">
      Loading Failed
    </p>
    <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
      {message} Please check your network connection and try again.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);
