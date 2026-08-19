import React, { useState, useEffect, useRef } from "react";
import { MdClose, MdArrowForward } from "react-icons/md";

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
      className={`text-sm font-medium ${
        isDark ? "text-gray-400" : "text-gray-500"
      }`}
    >
      {label}
    </span>
    <span
      className={`text-sm font-semibold ${
        isDark ? "text-gray-100" : "text-gray-800"
      }`}
    >
      {value || "N/A"}
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

  if (!linkData) return null;

  const isDark = theme === "dark";
  const itemData = linkData;
  const itemType = linkType || "link";

  const handleNavigate = (e) => {
    e.stopPropagation();
    if (onNavigateToSite && itemType === "site") {
      onNavigateToSite(itemData);
    }
  };

  return (
    // Backdrop
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        isVisible && !isClosing
          ? "bg-black/40 backdrop-blur-sm"
          : "bg-transparent"
      }`}
      onClick={handleBackdropClick}
      style={{ pointerEvents: linkData ? "auto" : "none" }}
    >
      {/* Popup Container */}
      <div
        ref={popupRef}
        className={`relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl border transition-all duration-200 ${
          isVisible && !isClosing
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        } ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
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
              className={`text-lg font-bold ${
                isDark ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {linkTitle || itemData.name || "Link Details"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* --- LINK TYPE CONTENT --- */}
          {itemType === "link" && itemData && (
            <div className="space-y-1">
              <div
                className={`divide-y ${
                  isDark ? "divide-gray-700" : "divide-gray-100"
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
                  value={itemData.bandwidth || itemData.Bandwidth || "10 Gbps"}
                  isDark={isDark}
                />
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
                className={`mt-4 pt-4 border-t ${
                  isDark ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Extended Details
                </p>
                <div
                  className={`divide-y ${
                    isDark ? "divide-gray-700" : "divide-gray-100"
                  }`}
                >
                  <DetailRow
                    label="Description"
                    value={itemData.description || itemData.Description || "Core backbone fiber link"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="Media Type"
                    value={itemData.mediaType || itemData.MediaType || itemData.media_type || "Fiber Optic"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="CDP Neighbor"
                    value={itemData.cdp || itemData.CDP || itemData.cdpNeighbors || "N/A"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="TX"
                    value={itemData.tx || itemData.TX || "N/A"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="RX"
                    value={itemData.rx || itemData.RX || "N/A"}
                    isDark={isDark}
                  />
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

          {/* --- SITE TYPE CONTENT --- */}
          {itemType === "site" && itemData && (
            <div className="space-y-1">
              <div
                className={`divide-y ${
                  isDark ? "divide-gray-700" : "divide-gray-100"
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
                className={`mt-4 pt-4 border-t ${
                  isDark ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Extended Details
                </p>
                <div
                  className={`divide-y ${
                    isDark ? "divide-gray-700" : "divide-gray-100"
                  }`}
                >
                  <DetailRow
                    label="Description"
                    value={itemData.description || "N/A"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="Media Type"
                    value={itemData.mediaType || "N/A"}
                    isDark={isDark}
                  />
                  <DetailRow
                    label="CDP Neighbors"
                    value={itemData.cdpNeighbors || "N/A"}
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
          className={`flex items-center justify-end px-6 py-4 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
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
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isDark
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
