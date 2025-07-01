import React from "react";

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {/* Header */}
      <div className="h-10 bg-gray-200 dark:bg-gray-700/50 rounded-md"></div>
      {/* Body Rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className={`h-8 bg-gray-200 dark:bg-gray-700 rounded-md ${
                  j === 0 ? "col-span-2" : ""
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
