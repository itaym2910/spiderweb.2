// src/AlertsPage.js (or src/pages/AlertsPage.js)
import React, { useState, useEffect, useMemo } from "react";
import { MdErrorOutline, MdWarningAmber, MdInfoOutline, MdNotifications } from "react-icons/md";

// Mock data generation (same as before)
const generateMockAlerts = () => {
  const alerts = [];
  const now = new Date();
  const types = ["error", "warning", "info"];
  const messages = [
    "Network line Alpha-01 experiencing high latency.",
    "Router Gamma-03 offline.",
    "Firewall policy update successful on Delta-Cluster.",
    "Network segment Beta-West approaching capacity.",
    "Unusual traffic pattern detected from IP 192.168.1.100.",
    "VPN connection dropped for user 'johndoe'.",
    "Server Epsilon-db CPU utilization at 95%.",
    "New device connected: IOT-Sensor-7B on VLAN 10.",
    "Security scan completed: 0 vulnerabilities found.",
    "Backup job 'DailySystemBackup' finished successfully.",
  ];

  for (let i = 0; i < 100; i++) { // Increased mock data for better scroll testing
    const randomMinutesAgo = Math.floor(Math.random() * 7 * 24 * 60 * 1.5); // Up to 1.5 weeks ago
    alerts.push({
      id: `alert-${i + 1}-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(now.getTime() - randomMinutesAgo * 60000),
      networkLine: `Line-${String.fromCharCode(65 + Math.floor(i / 10))}-${(i % 10) + 1}`,
    });
  }
  return alerts.sort((a, b) => b.timestamp - a.timestamp); // Newest first
};

// AlertIcon and AlertCard components (same as before)
const AlertIcon = ({ type }) => {
  if (type === "error") return <MdErrorOutline className="text-red-500 flex-shrink-0" size={24} />;
  if (type === "warning") return <MdWarningAmber className="text-yellow-500 flex-shrink-0" size={24} />;
  return <MdInfoOutline className="text-blue-500 flex-shrink-0" size={24} />;
};

const AlertCard = ({ alert }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-start space-x-3 hover:shadow-lg transition-shadow">
    <AlertIcon type={alert.type} />
    <div className="flex-1 min-w-0"> {/* Added min-w-0 for better text wrapping */}
      <p className="font-semibold text-gray-800 dark:text-white truncate">{alert.message}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Network Line: {alert.networkLine}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {alert.timestamp.toLocaleString()}
      </p>
    </div>
  </div>
);

const timePeriods = [
  { label: "1 Hour", value: "1h" },
  { label: "10 Hours", value: "10h" },
  { label: "24 Hours", value: "24h" },
  { label: "1 Week", value: "1w" },
  { label: "All Time", value: "all" },
];

export function AlertsPage() {
  const [allAlerts, setAllAlerts] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("1h"); // Default to 1 hour

  useEffect(() => {
    // Simulate fetching all alerts once on component mount
    setAllAlerts(generateMockAlerts());
  }, []);

  const filteredAlerts = useMemo(() => {
    if (!allAlerts.length) return [];

    const now = new Date();
    let startTime;

    switch (selectedPeriod) {
      case "1h":
        startTime = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        break;
      case "10h":
        startTime = new Date(now.getTime() - 10 * 60 * 60 * 1000);
        break;
      case "24h":
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "1w":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "all":
      default:
        return allAlerts; // Return all alerts if "all" or unknown period
    }
    return allAlerts.filter((alert) => alert.timestamp >= startTime);
  }, [allAlerts, selectedPeriod]);

  return (
    <div className="container mx-auto flex flex-col h-full"> {/* Ensure parent can constrain height if needed */}
      {/* Time Period Selector */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          {timePeriods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${
                  selectedPeriod === period.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List - Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-1 rounded-lg max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-200px)]">
        {/* Adjust max-h value as needed based on your header/footer/padding heights */}
        {/* e.g., 100vh (full viewport height) - app header height - page header height - time filter height - padding */}
        {filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 flex flex-col items-center justify-center h-full">
            <MdNotifications size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No alerts to display for the selected period.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Try selecting a different time range or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}