import React from "react";
import { ArrowUp, ArrowDown, XCircle } from "lucide-react";

/**
 * Reusable StatusIndicator component for network interface status.
 *
 * @param {object} props
 * @param {string} props.status - "Up", "Down", "Admin Down", or custom status string
 */
export const StatusIndicator = ({ status }) => {
  const config = {
    Up: { color: "text-green-500", Icon: ArrowUp, label: "Up" },
    Down: { color: "text-red-500", Icon: ArrowDown, label: "Down" },
    "Admin Down": {
      color: "text-gray-500",
      Icon: XCircle,
      label: "Admin Down",
    },
  }[status] || { color: "text-gray-500", Icon: XCircle, label: "Unknown" };

  return (
    <div className={`flex items-center gap-1.5 font-medium text-xs ${config.color}`}>
      <config.Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </div>
  );
};

export default StatusIndicator;
