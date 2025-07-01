import React from "react";

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/50">
    <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
    <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
      <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

export const GridSkeleton = ({ count = 10 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
