import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
    <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
      {text}
    </p>
  </div>
);
