// src/components/CoreSite/SiteDetailPopup.jsx
import React, { useState, useEffect } from "react";
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
  isOpen,
  onClose,
  siteData,
  // theme, // REMOVED: 'theme' prop is no longer needed here
  topPosition,
  zIndex,
  maxWidthVh,
  popupWidthPx,
  popupRightOffsetPx,
}) {
  const [isInterfaceDetailsOpen, setIsInterfaceDetailsOpen] = useState(false);

  const [currentTheme, setCurrentTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setCurrentTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  if (!siteData) return null;

  // All styling decisions now use 'currentTheme'
  const popupBg =
    currentTheme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-300";
  // ... other style variables using currentTheme ...
  const textColor = currentTheme === "dark" ? "text-gray-100" : "text-gray-900";
  const labelColor =
    currentTheme === "dark" ? "text-gray-400" : "text-gray-500";
  const valueColor =
    currentTheme === "dark"
      ? "text-white font-medium"
      : "text-gray-800 font-medium";
  const closeButtonHoverBg =
    currentTheme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200";
  const borderColor =
    currentTheme === "dark" ? "border-gray-600" : "border-gray-300";

  const bottomToggleButtonBg =
    currentTheme === "dark"
      ? "bg-gray-700 hover:bg-gray-600"
      : "bg-gray-200 hover:bg-gray-300";
  const bottomToggleButtonText =
    currentTheme === "dark" ? "text-blue-400" : "text-blue-600";

  const siteIdentifier = siteData.name || `Site ${siteData.id}`;
  const buttonText = `${siteIdentifier} Details`;

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

  const scrollbarClasses =
    currentTheme === "dark"
      ? "dark-scrollbar dark-scrollbar-firefox"
      : "light-scrollbar light-scrollbar-firefox";

  return (
    <div
      style={dynamicStyles}
      className={`fixed ${popupBg} p-6 flex flex-col 
                 transform transition-all duration-300 ease-in-out 
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
      <div className={`flex justify-between items-center mb-4 pb-4 shrink-0`}>
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
            currentTheme === "dark"
              ? "focus:ring-offset-gray-800"
              : "focus:ring-offset-white"
          } focus:ring-blue-500 flex-shrink-0`}
          aria-label="Close site details"
        >
          <MdClose size={22} />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div
        className={`flex-1 overflow-y-auto space-y-4 pr-5 min-h-0 relative ${scrollbarClasses}`}
      >
        {/* ... content ... */}
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
        <div className={`flex justify-between items-center pt-3`}>
          <DetailItem
            label="Bandwidth"
            value={siteData.bandwidth}
            labelColor={labelColor}
            valueColor={valueColor}
          />
        </div>
        {isInterfaceDetailsOpen && (
          <div
            id={`link-interface-details-section-${siteData.id}`}
            className="space-y-4 pt-2"
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
        <div className="h-0" /> {/* Spacer div */}
        <div
          className={`sticky bottom-4 w-full flex justify-end pr-0 pointer-events-none z-10`}
        >
          <button
            onClick={toggleInterfaceDetails}
            aria-expanded={isInterfaceDetailsOpen}
            aria-controls={`link-interface-details-section-${siteData.id}`}
            className={`p-2 rounded-full shadow-md pointer-events-auto
                          focus:outline-none focus:ring-2 focus:ring-opacity-75
                          ${bottomToggleButtonBg} ${bottomToggleButtonText}
                          ${
                            currentTheme === "dark"
                              ? "focus:ring-blue-500"
                              : "focus:ring-blue-600"
                          }`}
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
      </div>
    </div>
  );
}
