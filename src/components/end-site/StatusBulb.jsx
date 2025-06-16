// src/components/StatusBulb.jsx (or similar path)
import React from "react";

const StatusBulb = ({ status }) => {
  let bgColor = "bg-gray-400 dark:bg-gray-500";
  let title = "Unknown";

  if (status === "up") {
    bgColor = "bg-green-500 dark:bg-green-400";
    title = "Up";
  } else if (status === "down") {
    bgColor = "bg-red-500 dark:bg-red-400";
    title = "Down";
  } else if (status === "issue") {
    bgColor = "bg-yellow-500 dark:bg-yellow-400";
    title = "Issue";
  }

  return (
    <div
      className={`w-4 h-4 rounded-full ${bgColor} flex-shrink-0`}
      title={title}
    ></div>
  );
};

export default StatusBulb;
