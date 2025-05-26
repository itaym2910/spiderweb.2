// src/AlertsPage.js
import React, { useState, useEffect } from "react";
import { MdErrorOutline, MdWarningAmber, MdInfoOutline, MdNotifications } from "react-icons/md";

// Mock data (same as before)
const generateMockAlerts = () => {
  // ... (generateMockAlerts function remains the same)
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
  ];

  for (let i = 0; i < 50; i++) {
    const randomMinutesAgo = Math.floor(Math.random() * 7 * 24 * 60); // Up to 1 week ago
    alerts.push({
      id: `alert-${i + 1}-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(now.getTime() - randomMinutesAgo * 60000),
      networkLine: `Line-${String.fromCharCode(65 + Math.floor(i / 5))}-${(i % 5) + 1}`,
    });
  }
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
};

const AlertIcon = ({ type }) => {
  // ... (AlertIcon component remains the same)
  if (type === "error") return <MdErrorOutline className="text-red-500 flex-shrink-0" size={24} />;
  if (type === "warning") return <MdWarningAmber className="text-yellow-500 flex-shrink-0" size={24} />;
  return <MdInfoOutline className="text-blue-500 flex-shrink-0" size={24} />;
};

const AlertCard = ({ alert }) => (
  // ... (AlertCard component remains the same)
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-start space-x-3 hover:shadow-lg transition-shadow">
    <AlertIcon type={alert.type} />
    <div className="flex-1">
      <p className="font-semibold text-gray-800 dark:text-white">{alert.message}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Network Line: {alert.networkLine}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {alert.timestamp.toLocaleString()}
      </p>
    </div>
  </div>
);

export function AlertsPage() {
  const [allAlerts, setAllAlerts] = useState([]);

  useEffect(() => {
    setAllAlerts(generateMockAlerts());
  }, []);

  const filterAlertsByTime = (alerts, hoursAgoStart, hoursAgoEnd = 0) => {
    // ... (filterAlertsByTime function remains the same)
    const now = new Date();
    const startTime = new Date(now.getTime() - hoursAgoStart * 60 * 60 * 1000);
    const endTime = new Date(now.getTime() - hoursAgoEnd * 60 * 60 * 1000);
    return alerts.filter(
      (alert) => alert.timestamp >= startTime && alert.timestamp < endTime
    );
  };
  
  const alertsLastHour = filterAlertsByTime(allAlerts, 1);
  const alertsLast1To10Hours = filterAlertsByTime(allAlerts, 10, 1);
  const alertsLast10To24Hours = filterAlertsByTime(allAlerts, 24, 10);
  const alertsLast24HoursTo1Week = filterAlertsByTime(allAlerts, 24 * 7, 24);

  const AlertSection = ({ title, alerts }) => {
    // ... (AlertSection component remains the same)
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No alerts in this period.</p>
        )}
      </div>
    );
  };

  return (
    // ... (AlertsPage return JSX remains the same)
    <div className="container mx-auto">
      <AlertSection title="Last 1 Hour" alerts={alertsLastHour} />
      <AlertSection title="Next 9 Hours (1-10 hours ago)" alerts={alertsLast1To10Hours} />
      <AlertSection title="Next 14 Hours (10-24 hours ago)" alerts={alertsLast10To24Hours} />
      <AlertSection title="Last Week (excluding last 24 hours)" alerts={alertsLast24HoursTo1Week} />

      {allAlerts.length === 0 && (
         <div className="text-center py-10">
            <MdNotifications size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
                No alerts to display.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
                Everything looks quiet for now!
            </p>
         </div>
      )}
    </div>
  );
}