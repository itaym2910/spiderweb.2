import React, { useState, useEffect, useMemo } from "react";
import { MdErrorOutline, MdWarningAmber, MdInfoOutline, MdNotifications, MdClose } from "react-icons/md"; // Added MdClose

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
      networkLine: `Line-${String.fromCharCode(65 + Math.floor(i / 10))}-${(i % 10) + 1}`,
      details: `This is a more detailed description for alert ${i + 1}. It might include diagnostic information, affected systems, or suggested actions. For example, if it's a latency issue, this might show traceroute results or specific metrics. If it's a security alert, it might link to an incident report.`,
      source: `SourceSystem-${Math.floor(Math.random() * 5) + 1}`,
      severityScore: Math.floor(Math.random() * 10) + 1,
    });
  }
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
};

const AlertIcon = ({ type, size = 24 }) => { // Added size prop with default
  if (type === "error") return <MdErrorOutline className="text-red-500 flex-shrink-0" size={size} />;
  if (type === "warning") return <MdWarningAmber className="text-yellow-500 flex-shrink-0" size={size} />;
  return <MdInfoOutline className="text-blue-500 flex-shrink-0" size={size} />;
};

// New AlertModal Component
const AlertModal = ({ alert, onClose }) => {
  if (!alert) return null;

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose} // Close on overlay click
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
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
            <p className={`text-sm font-medium ${alert.type === "error" ? "text-red-600 dark:text-red-400" :
                alert.type === "warning" ? "text-yellow-600 dark:text-yellow-400" :
                  "text-blue-600 dark:text-blue-400"
              }`}>
              Type: {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Message:</strong>
            <span className="text-gray-600 dark:text-gray-400 ml-1">{alert.message}</span>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Timestamp:</strong>
            <span className="text-gray-600 dark:text-gray-400 ml-1">{alert.timestamp.toLocaleString()}</span>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Network Line:</strong>
            <span className="text-gray-600 dark:text-gray-400 ml-1">{alert.networkLine}</span>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Source:</strong>
            <span className="text-gray-600 dark:text-gray-400 ml-1">{alert.source}</span>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Severity Score:</strong>
            <span className="text-gray-600 dark:text-gray-400 ml-1">{alert.severityScore}/10</span>
          </p>
          <div className="pt-2">
            <strong className="text-gray-700 dark:text-gray-300 block mb-1">Details:</strong>
            <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-xs leading-relaxed">
              {alert.details}
            </p>
          </div>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">ID:</strong>
            <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">{alert.id}</span>
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


const AlertCard = ({ alert, onClick }) => ( // Added onClick prop
  <div
    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-start space-x-3 hover:shadow-lg transition-shadow cursor-pointer" // Added cursor-pointer
    onClick={onClick} // Added onClick handler
  >
    <AlertIcon type={alert.type} />
    <div className="flex-1 min-w-0">
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
  const [selectedPeriod, setSelectedPeriod] = useState("1h");
  const [selectedAlert, setSelectedAlert] = useState(null); // For modal
  const [isModalOpen, setIsModalOpen] = useState(false);   // For modal visibility

  useEffect(() => {
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
    setSelectedAlert(null);
  };

  return (
    <> {/* Using Fragment to allow modal to be a sibling at the top level */}
      <div className="container mx-auto flex flex-col h-[90%]">
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
          <div className="flex flex-wrap gap-2">
            {timePeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${selectedPeriod === period.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-1 rounded-lg max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-200px)]">
          {filteredAlerts.length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onClick={() => handleAlertClick(alert)} // Pass handler to AlertCard
                />
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

      {/* Modal Rendering */}
      {isModalOpen && selectedAlert && (
        <AlertModal alert={selectedAlert} onClose={handleCloseModal} />
      )}
    </>
  );
}