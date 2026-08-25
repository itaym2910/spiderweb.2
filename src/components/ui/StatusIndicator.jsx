import React from "react";
import { ArrowUp, ArrowDown, XCircle } from "lucide-react";

/**
 * Reusable StatusIndicator component for network interface status.
 *
 * @param {object} props
 * @param {string} props.status - "Up", "Down", "Admin Down", or custom status string
 * @param {string} props.size - "sm", "md", "lg"
 */
export const StatusIndicator = ({ status, size = "sm" }) => {
  const config = {
    Up: { color: "text-green-500", Icon: ArrowUp, label: "Up" },
    Down: { color: "text-red-500", Icon: ArrowDown, label: "Down" },
    "Admin Down": {
      color: "text-gray-500",
      Icon: XCircle,
      label: "Admin Down",
    },
  }[status] || { color: "text-gray-500", Icon: XCircle, label: "Unknown" };

  const textClass = size === "lg" ? "text-sm" : size === "md" ? "text-xs" : "text-[10px]";
  const iconClass = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3 w-3";

  return (
    <div className={`flex items-center gap-1 font-semibold ${textClass} ${config.color}`}>
      <config.Icon className={iconClass} />
      <span>{config.label}</span>
    </div>
  );
};

export default StatusIndicator;
