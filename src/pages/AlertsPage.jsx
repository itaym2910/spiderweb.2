import React, { useState, useEffect, useMemo } from "react";
import {
  MdErrorOutline,
  MdWarningAmber,
  MdInfoOutline,
  MdNotifications,
  MdClose,
} from "react-icons/md";

// --- MOCK DATA & MODAL (No style changes needed, they are self-contained) ---

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

  for (let i = 0; i < 100; i++) {
    const randomMinutesAgo = Math.floor(Math.random() * 7 * 24 * 60 * 1.5);
    alerts.push({
      id: `alert-${i + 1}-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(now.getTime() - randomMinutesAgo * 60000),
      networkLine: `Line-${String.fromCharCode(65 + Math.floor(i / 10))}-${
        (i % 10) + 1
      }`,
      details: `This is a more detailed description for alert ${
        i + 1
      }. It might include diagnostic information, affected systems, or suggested actions. For example, if it's a latency issue, this might show traceroute results or specific metrics. If it's a security alert, it might link to an incident report.`,
      source: `SourceSystem-${Math.floor(Math.random() * 5) + 1}`,
      severityScore: Math.floor(Math.random() * 10) + 1,
    });
  }
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
};

const AlertIcon = ({ type, size = 24 }) => {
  if (type === "error")
    return (
      <MdErrorOutline className="text-red-500 flex-shrink-0" size={size} />
    );
  if (type === "warning")
    return (
      <MdWarningAmber className="text-yellow-500 flex-shrink-0" size={size} />
    );
  return <MdInfoOutline className="text-blue-500 flex-shrink-0" size={size} />;
};

const AlertModal = ({ alert, onClose }) => {
  if (!alert) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <MdClose size={24} />
        </button>
        <div className="flex items-start space-x-3 mb-4">
          <AlertIcon type={alert.type} size={32} />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Alert Details
            </h2>
            <p
              className={`text-sm font-medium ${
                alert.type === "error"
                  ? "text-red-600 dark:text-red-400"
                  : alert.type === "warning"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              Type: {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
            </p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Message:
            </strong>
            <span className="text-gray-600 dark:text-gray-400 ml-1">
              {alert.message}
            </span>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Timestamp:
            </strong>
            <span className="text-gray-600 dark:text-gray-400 ml-1">
              {alert.timestamp.toLocaleString()}
            </span>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Network Line:
            </strong>
            <span className="text-gray-600 dark:text-gray-400 ml-1">
              {alert.networkLine}
            </span>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Source:
            </strong>
            <span className="text-gray-600 dark:text-gray-400 ml-1">
              {alert.source}
            </span>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Severity Score:
            </strong>
            <span className="text-gray-600 dark:text-gray-400 ml-1">
              {alert.severityScore}/10
            </span>
          </p>
          <div className="pt-2">
            <strong className="text-gray-700 dark:text-gray-300 block mb-1">
              Details:
            </strong>
            <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-xs leading-relaxed">
              {alert.details}
            </p>
          </div>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">ID:</strong>
            <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">
              {alert.id}
            </span>
          </p>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- STYLES UPDATED ---
const AlertCard = ({ alert, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-transparent dark:hover:border-blue-500 hover:border-blue-400"
  >
    <div className="flex items-start space-x-4">
      <AlertIcon type={alert.type} size={28} />
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-gray-800 dark:text-white truncate"
          title={alert.message}
        >
          {alert.message}
        </p>
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs space-y-1">
          <p className="text-gray-600 dark:text-gray-300">
            <strong>Network Line:</strong> {alert.networkLine}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {alert.timestamp.toLocaleString()}
          </p>
        </div>
      </div>
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

// --- STYLES UPDATED ---
export function AlertsPage() {
  const [allAlerts, setAllAlerts] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("1h");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setAllAlerts(generateMockAlerts());
  }, []);

  const filteredAlerts = useMemo(() => {
    // ... filtering logic remains the same
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
        return allAlerts;
    }
    return allAlerts.filter((alert) => alert.timestamp >= startTime);
  }, [allAlerts, selectedPeriod]);

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAlert(null); // Good practice to clear after close
  };

  return (
    <>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            System Alerts
          </h1>
          <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
            Review real-time alerts from the network infrastructure.
          </p>
        </header>

        <div className="mb-8">
          <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 max-w-lg">
            {timePeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500
                  ${
                    selectedPeriod === period.value
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          {filteredAlerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onClick={() => handleAlertClick(alert)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <MdNotifications
                size={56}
                className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
              />
              <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                All Clear!
              </p>
              <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
                No alerts found for the selected period. Try a wider time range.
              </p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedAlert && (
        <AlertModal alert={selectedAlert} onClose={handleCloseModal} />
      )}
    </>
  );
}
