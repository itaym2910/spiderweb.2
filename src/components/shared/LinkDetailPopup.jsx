import React, { useState, useEffect, useRef } from "react";
import { MdClose, MdArrowForward } from "react-icons/md";
import { AlertTriangle } from "lucide-react";
import { api, getLinkDetails } from "../../services/apiServices";
import { formatPingRateWithPackets } from "./pingHelpers";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "null") return "N/A";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
  } catch {
    return dateStr;
  }
};

/**
 * A reusable status indicator bulb.
 */
const StatusBulb = ({ status }) => {
  let bgColor = "bg-gray-400 dark:bg-gray-500";
  if (status === "up") bgColor = "bg-green-500 dark:bg-green-400";
  else if (status === "down") bgColor = "bg-red-500 dark:bg-red-400";
  else if (status === "issue") bgColor = "bg-yellow-500 dark:bg-yellow-400";

  return (
    <div className={`w-3.5 h-3.5 rounded-full ${bgColor} flex-shrink-0`}></div>
  );
};

/**
 * A detail row used inside the popup.
 */
const DetailRow = ({ label, value, isDark }) => (
  <div className="flex items-center justify-between py-2 px-1">
    <span
      className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"
        }`}
    >
      {label}
    </span>
    <span
      className={`text-sm font-semibold ${isDark ? "text-gray-100" : "text-gray-800"
        }`}
    >
      {value !== undefined && value !== null && value !== "" ? value : "N/A"}
    </span>
  </div>
);

/**
 * A modal popup that displays link/site details.
 * Replaces the old tab-based LinkDetailTabs component.
 *
 * Props:
 * - linkData: The data object for the clicked link/site (or null to hide).
 * - linkType: "link" or "site"
 * - linkTitle: Display title for the popup header.
 * - onClose: Callback to close the popup.
 * - onNavigateToSite: Optional callback for site-type items.
 * - theme: "dark" or "light"
 */
const formatLastPing = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return String(timestamp);
    return d.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return String(timestamp);
  }
};

const LinkDetailPopup = ({
  linkData,
  linkType,
  linkTitle,
  onClose,
  onNavigateToSite,
  theme,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const popupRef = useRef(null);

  // Animate in on mount / data change
  useEffect(() => {
    if (linkData) {
      setIsClosing(false);
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => setIsVisible(true));
    }
  }, [linkData]);

  // Close with animation
  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (linkData) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [linkData]);

  const [fetchedDetails, setFetchedDetails] = useState(null);
  const isDark = theme === "dark";
  const itemType = linkType || "link";

  useEffect(() => {
    setFetchedDetails(null);
    if (itemType === "link" && linkData && !linkData.skipFetch) {
      const { coredevice_id, neighbor_coredevice_id, local_interface } = linkData;
      
      // Also try to get them from rawLink if they were nested
      const cid = coredevice_id || (linkData.rawLink && linkData.rawLink.coredevice_id);
      const ncid = neighbor_coredevice_id || (linkData.rawLink && linkData.rawLink.neighbor_coredevice_id);
      const name = local_interface || (linkData.rawLink && linkData.rawLink.local_interface);

      if (cid && ncid && name) {
        getLinkDetails(cid, ncid, name)
          .then(data => {
            if (data && data.length > 0) {
              setFetchedDetails(data[0]);
            }
          })
          .catch(err => console.error("Failed to fetch link details:", err));
      }
    }
  }, [linkData, itemType]);

  if (!linkData) return null;

  const itemData = {
    ...linkData,
    ...(fetchedDetails ? {
      description: fetchedDetails?.description || linkData?.description,
      mediaType: fetchedDetails?.media_type || fetchedDetails?.mediaType || linkData?.mediaType,
      tx: fetchedDetails?.tx !== undefined ? (typeof fetchedDetails.tx === "number" ? `${fetchedDetails.tx} dBm` : fetchedDetails.tx) : linkData?.tx,
      rx: fetchedDetails?.rx !== undefined ? (typeof fetchedDetails.rx === "number" ? `${fetchedDetails.rx} dBm` : fetchedDetails.rx) : linkData?.rx,
      mtu: fetchedDetails?.mtu !== undefined ? String(fetchedDetails.mtu) : (linkData?.mtu !== undefined ? String(linkData.mtu) : undefined),
      physicalStatus: fetchedDetails?.physical_status || linkData?.physicalStatus,
      protocolStatus: fetchedDetails?.protocol_status || linkData?.protocolStatus,
      mpls: fetchedDetails?.mpls_ldp || linkData?.mpls,
      ospf: fetchedDetails?.ospf || fetchedDetails?.ospf_state || linkData?.ospf,
      bandwidth: fetchedDetails?.bw || fetchedDetails?.bandwidth || linkData?.bandwidth,
      ping_success_rate: fetchedDetails?.ping_success_rate !== undefined ? fetchedDetails.ping_success_rate : linkData?.ping_success_rate,
      ping_packets_success: fetchedDetails?.ping_packets_success !== undefined ? fetchedDetails.ping_packets_success : (linkData?.ping_packets_success ?? linkData?.packets_success),
      ping_packets_total: fetchedDetails?.ping_packets_total !== undefined ? fetchedDetails.ping_packets_total : (linkData?.ping_packets_total ?? linkData?.packets_total),
      ping_ratio: fetchedDetails?.ping_ratio ?? linkData?.ping_ratio,
      total_pings: fetchedDetails?.total_pings ?? linkData?.total_pings,
      ping_total: fetchedDetails?.ping_total ?? linkData?.ping_total,
      last_ping_at: fetchedDetails?.last_ping_at || linkData?.last_ping_at,
    } : {}),
  };

  const rawPingRate =
    itemData?.ping_success_rate ??
    itemData?.rawLink?.ping_success_rate ??
    itemData?.pingSuccessRate;
  const rawPingPacketsSuccess =
    itemData?.ping_packets_success ??
    itemData?.rawLink?.ping_packets_success ??
    itemData?.packets_success ??
    itemData?.rawLink?.packets_success ??
    itemData?.pingPacketsSuccess;
  const rawPingPacketsTotal =
    itemData?.ping_packets_total ??
    itemData?.rawLink?.ping_packets_total ??
    itemData?.packets_total ??
    itemData?.rawLink?.packets_total ??
    itemData?.pingPacketsTotal;
  const rawLastPing =
    itemData?.last_ping_at ??
    itemData?.rawLink?.last_ping_at ??
    itemData?.lastPingAt;
  const mtuValue =
    itemData?.mtu ??
    itemData?.rawLink?.mtu ??
    "N/A";

  const handleNavigate = (e) => {
    e.stopPropagation();
    if (onNavigateToSite && itemType === "site") {
      onNavigateToSite(itemData);
    }
  };

  return (
    // Backdrop
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${isVisible && !isClosing
        ? "bg-black/40 backdrop-blur-sm"
        : "bg-transparent"
        }`}
      onClick={handleBackdropClick}
      style={{ pointerEvents: linkData ? "auto" : "none" }}
    >
      {/* Popup Container */}
      <div
        ref={popupRef}
        className={`relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl border transition-all duration-200 ${isVisible && !isClosing
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-4"
          } ${isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
          }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"
            }`}
        >
          <div className="flex items-center space-x-3">
            <StatusBulb
              status={
                itemType === "site"
                  ? itemData.protocolStatus === "Up"
                    ? "up"
                    : "down"
                  : itemData.status || "up"
              }
            />
            <h3
              className={`text-lg font-bold ${isDark ? "text-gray-100" : "text-gray-800"
                }`}
            >
              {linkTitle || itemData.name || "Link Details"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-full transition-colors ${isDark
              ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              }`}
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {/* --- LINK TYPE CONTENT --- */}
          {itemType === "link" && itemData && !itemData.isCoreTopology && (
            <div className="space-y-1">
              <div
                className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-100"
                  }`}
              >
                <DetailRow
                  label="Physical Status"
                  value={itemData.physicalStatus || itemData.physical_status || "Up"}
                  isDark={isDark}
                />
                <DetailRow
                  label="Protocol Status"
                  value={itemData.protocolStatus || itemData.protocol_status || "Up"}
                  isDark={isDark}
                />
                <DetailRow
                  label="MPLS"
                  value={itemData.mpls || itemData.MPLS || "Enabled"}
                  isDark={isDark}
                />
                <DetailRow
                  label="OSPF"
                  value={itemData.ospf || itemData.OSPF || "Enabled"}
                  isDark={isDark}
                />
                <DetailRow
                  label="Bandwidth"
                  value={
                    itemData.bandwidth ||
                    itemData.Bandwidth ||
                    (itemData.bandwidth_mbps ? `${itemData.bandwidth_mbps} Mbps` : "10 Gbps")
                  }
                  isDark={isDark}
                />
                {(() => {
                  const pingInfo = formatPingRateWithPackets(itemData);
                  if (!pingInfo) return null;
                  const numRate = pingInfo.rate;
                  const packetsLost = pingInfo.packetsLost ?? (numRate < 100 ? 1 : 0);
                  const hasLoss = packetsLost > 0 || numRate < 100;
                  const isDown = numRate === 0;
                  return (
                    <div className="flex items-center justify-between py-2 px-1">
                      <span
                        className={`text-sm font-medium ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Ping Success Rate
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-semibold flex-wrap justify-end">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isDown
                              ? "bg-rose-500"
                              : hasLoss
                              ? "bg-amber-500 animate-pulse"
                              : "bg-emerald-500"
                          }`}
                        />
                        <span
                          className={
                            isDown
                              ? "text-rose-600 dark:text-rose-400"
                              : hasLoss
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }
                          title={`${pingInfo.packetsSuccess ?? "?"}/${pingInfo.packetsTotal ?? "?"} packets received${hasLoss ? ` • ${packetsLost} packet(s) lost!` : ""}`}
                        >
                          {pingInfo.full}
                        </span>
                        {hasLoss && !isDown && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{packetsLost} lost</span>
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })()}
                {itemData.sourceZone && itemData.sourceZone !== "N/A" && (
                  <DetailRow
                    label="Source Zone"
                    value={itemData.sourceZone}
                    isDark={isDark}
                  />
                )}
                {itemData.targetZone && itemData.targetZone !== "N/A" && (
                  <DetailRow
                    label="Target Zone"
                    value={itemData.targetZone}
                    isDark={isDark}
                  />
                )}
              </div>

              {/* Expanded details section */}
              <div
                className={`mt-4 pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"
                  }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                >
                  Extended Details
                </p>
                <div
                  className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-100"
                    }`}
                >
                  <DetailRow
                    label="Description"
                    value={itemData?.description || itemData?.Description || "Core backbone fiber link"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="Media Type"
                    value={itemData?.mediaType || itemData?.MediaType || itemData?.media_type || "Fiber Optic"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="TX"
                    value={itemData.tx || "N/A"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="RX"
                    value={itemData.rx || "N/A"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="MTU"
                    value={mtuValue}
                    isDark={isDark}
                  />
                  {rawLastPing && (
                    <DetailRow
                      label="Last Ping"
                      value={formatLastPing(rawLastPing)}
                      isDark={isDark}
                    />
                  )}
                  {itemData.ip && itemData.ip !== "N/A" && (
                    <DetailRow
                      label="IP Address"
                      value={itemData.ip}
                      isDark={isDark}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- CORE TOPOLOGY LINK CONTENT --- */}
          {itemType === "link" && itemData && itemData.isCoreTopology && itemData.rawLink && (() => {
            const localDeviceKeys = [];
            const remoteDeviceKeys = [];
            const linkDetailsKeys = [];

            Object.entries(itemData.rawLink).forEach(([key, value]) => {
              if (typeof value === "object" && value !== null) return;
              
              // Exclude IDs
              if (key === "id" || key.endsWith("_id")) return;
              // Exclude Remote Device IP
              if (key === "remote_device_ip") return;
              // Exclude Dates
              if (key.endsWith("_at")) return;
              if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T/)) return;
              
              // Exclude specific fields requested by user
              if (key === "is_ospf_full" || key === "link_drops_last_24h" || key === "ospf_drops_last_24h") return;

              if (key.startsWith("local_")) {
                localDeviceKeys.push([key, value]);
              } else if (key.startsWith("remote_")) {
                remoteDeviceKeys.push([key, value]);
              } else {
                linkDetailsKeys.push([key, value]);
              }
            });

            const renderGroup = (title, entries, hideBorderTop = false) => {
              if (entries.length === 0) return null;
              return (
                <div className={hideBorderTop ? "" : `mt-4 pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {title}
                  </p>
                  <div className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-100"}`}>
                    {entries.map(([key, value]) => {
                      const formattedKey = key
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");

                      let displayValue = value;
                      if (typeof value === "boolean") {
                        displayValue = value ? "Yes" : "No";
                      } else if (key === "ping_success_rate") {
                        const pInfo = formatPingRateWithPackets(itemData?.rawLink || itemData);
                        if (pInfo) {
                          const lostCount = pInfo.packetsLost ?? (pInfo.rate < 100 ? 1 : 0);
                          displayValue = lostCount > 0 ? `${pInfo.full} (⚠️ ${lostCount} lost)` : pInfo.full;
                        } else {
                          displayValue = `${value}%`;
                        }
                      } else if (key === "bandwidth_mbps") {
                        displayValue = typeof value === "number"
                          ? (value >= 1000 ? `${value / 1000} Gbps (${value} Mbps)` : `${value} Mbps`)
                          : value;
                      }

                      return (
                        <DetailRow
                          key={key}
                          label={formattedKey}
                          value={displayValue}
                          isDark={isDark}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            };

            return (
              <div className="space-y-1">
                {renderGroup("Local Device", localDeviceKeys, true)}
                {renderGroup("Remote Device", remoteDeviceKeys)}
                {renderGroup("Link Details", linkDetailsKeys)}
              </div>
            );
          })()}

          {/* --- SITE TYPE CONTENT --- */}
          {itemType === "site" && itemData && (
            <div className="space-y-1">
              <div
                className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-100"
                  }`}
              >
                <DetailRow label="Physical" value="Up" isDark={isDark} />
                <DetailRow
                  label="Protocol"
                  value={itemData.protocolStatus}
                  isDark={isDark}
                />
                <DetailRow
                  label="MPLS"
                  value={itemData.mplsStatus}
                  isDark={isDark}
                />
                <DetailRow
                  label="OSPF"
                  value={itemData.ospfStatus}
                  isDark={isDark}
                />
                <DetailRow
                  label="Bandwidth"
                  value="100 Gbps"
                  isDark={isDark}
                />
              </div>

              {/* Expanded details section */}
              <div
                className={`mt-4 pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"
                  }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                >
                  Extended Details
                </p>
                <div
                  className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-100"
                    }`}
                >
                  <DetailRow
                    label="Description"
                    value={itemData?.description || "N/A"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="Media Type"
                    value={itemData?.mediaType || "N/A"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="CDP Neighbors"
                    value={itemData?.cdpNeighbors || "N/A"}
                    isDark={isDark}
                  />
                  <DetailRow label="TX" value="98.5 Gbps" isDark={isDark} />
                  <DetailRow label="RX" value="95.1 Gbps" isDark={isDark} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end px-6 py-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"
            }`}
        >
          {itemType === "site" && onNavigateToSite && (
            <button
              onClick={handleNavigate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 mr-3 transition-colors"
            >
              Go to Site Details
              <MdArrowForward />
            </button>
          )}
          <button
            onClick={handleClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark
              ? "text-gray-300 bg-gray-700 hover:bg-gray-600"
              : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkDetailPopup;
