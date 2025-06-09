// src/components/CoreSite/SiteDetailPopup.jsx
import React, { useState } from "react"; // Removed useEffect as showPopup is removed
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdClose,
} from "react-icons/md";

const DetailItem = ({ label, value, labelColor, valueColor }) => (
  <div>
    <p className={`text-xs uppercase tracking-wider ${labelColor}`}>{label}</p>
    <p className={`text-base ${valueColor}`}>{value || "N/A"}</p>
  </div>
);

export default function SiteDetailPopup({
  isOpen, // This prop now controls the animation trigger
  onClose,
  siteData,
  theme = "dark",
  // --- Props for stacking ---
  topPosition,
  zIndex,
  maxWidthVh,
  popupWidthPx,
  popupRightOffsetPx,
}) {
  const [isInterfaceDetailsOpen, setIsInterfaceDetailsOpen] = useState(false);
  // const [showPopup, setShowPopup] = useState(false); // --- REMOVED THIS LINE ---

  if (!siteData) return null;

  const popupBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-300";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const labelColor = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const valueColor =
    theme === "dark" ? "text-white font-medium" : "text-gray-800 font-medium";
  const closeButtonHoverBg =
    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200";
  const borderColor = theme === "dark" ? "border-gray-600" : "border-gray-300";
  const toggleButtonColor =
    theme === "dark"
      ? "text-blue-400 hover:text-blue-300"
      : "text-blue-600 hover:text-blue-700";

  const siteNameForButton = siteData.name || "Site";
  const buttonText = `${siteNameForButton} Details`;

  const toggleInterfaceDetails = () => {
    setIsInterfaceDetailsOpen(!isInterfaceDetailsOpen);
  };

  const dynamicStyles = {
    top: `${topPosition}px`,
    right: `${popupRightOffsetPx}px`,
    width: `${popupWidthPx}px`,
    maxHeight: `${maxWidthVh}vh`,
    zIndex: zIndex,
  };

  return (
    <div
      style={dynamicStyles}
      className={`fixed ${popupBg} shadow-2xl p-6 flex flex-col 
                 transform transition-transform duration-300 ease-in-out 
                 border ${borderColor} rounded-lg pointer-events-auto
                 ${
                   isOpen
                     ? "translate-x-0 opacity-100"
                     : "translate-x-full opacity-0"
                 }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`site-detail-popup-title-${siteData.id}`}
    >
      {/* Header */}
      <div
        className={`flex justify-between items-center mb-6 pb-4 border-b ${borderColor}`}
      >
        <button
          id={`site-detail-popup-title-${siteData.id}`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 truncate"
          style={{ maxWidth: "calc(100% - 40px)" }}
        >
          {buttonText}
        </button>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-full ${textColor} ${closeButtonHoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            theme === "dark"
              ? "focus:ring-offset-gray-800"
              : "focus:ring-offset-white"
          } focus:ring-blue-500 flex-shrink-0`}
          aria-label="Close site details"
        >
          <MdClose size={22} />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
        <DetailItem
          label="Site Name"
          value={siteData.name}
          labelColor={labelColor}
          valueColor={valueColor}
        />
        <DetailItem
          label="Link Status"
          value={siteData.linkStatus}
          labelColor={labelColor}
          valueColor={valueColor}
        />
        <DetailItem
          label="Protocol Status"
          value={siteData.protocolStatus}
          labelColor={labelColor}
          valueColor={valueColor}
        />
        <DetailItem
          label="Bandwidth"
          value={siteData.bandwidth}
          labelColor={labelColor}
          valueColor={valueColor}
        />

        <div
          className={`pt-3 mt-3 border-t ${borderColor} flex justify-center`}
        >
          <button
            onClick={toggleInterfaceDetails}
            className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              theme === "dark"
                ? "focus:ring-blue-500 hover:bg-gray-700"
                : "focus:ring-blue-500 hover:bg-gray-100"
            } ${toggleButtonColor}`}
            aria-expanded={isInterfaceDetailsOpen}
            aria-controls={`link-interface-details-section-${siteData.id}`}
            aria-label={
              isInterfaceDetailsOpen
                ? "Hide link interface details"
                : "Show link interface details"
            }
          >
            {isInterfaceDetailsOpen ? (
              <MdKeyboardArrowUp size={24} />
            ) : (
              <MdKeyboardArrowDown size={24} />
            )}
          </button>
        </div>

        {isInterfaceDetailsOpen && (
          <div
            id={`link-interface-details-section-${siteData.id}`}
            className="space-y-3 pt-2"
          >
            <DetailItem
              label="MPLS"
              value={siteData.mpls}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="CVC"
              value={siteData.cvc}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="TX"
              value={siteData.tx}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="RX"
              value={siteData.rx}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="Interface Type"
              value={siteData.interfaceType}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="Duplex Mode"
              value={siteData.duplexMode}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="Speed"
              value={siteData.speed}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="Error Rate"
              value={siteData.errorRate}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="MTU"
              value={siteData.mtu}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="Administrative Status"
              value={siteData.adminStatus}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="Utilization"
              value={siteData.utilization}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="Jitter"
              value={siteData.jitter}
              labelColor={labelColor}
              valueColor={valueColor}
            />
          </div>
        )}
      </div>
    </div>
  );
}
