// src/components/CoreSite/SiteDetailPopup.jsx
import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// ... (DetailItem component remains the same) ...
const DetailItem = ({
  label,
  value,
  labelColor,
  valueColor,
  className = "",
}) => (
  <div className={className}>
    <p className={`text-xs uppercase tracking-wider ${labelColor}`}>{label}</p>
    <p className={`text-base ${valueColor}`}>{value || "N/A"}</p>
  </div>
);

export default function SiteDetailPopup({
  isOpen,
  onClose,
  detailData,
  topPosition,
  zIndex,
  maxHeightPx,
  popupWidthPx,
  popupRightOffsetPx,
}) {
  const navigate = useNavigate();
  // ... (theme state and useEffect for theme sync remain the same) ...
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

  if (!detailData) return null;

  // ... (style constants remain the same) ...
  const popupBgClass = currentTheme === "dark" ? "bg-gray-800" : "bg-white";
  const popupBorderColorClass =
    currentTheme === "dark" ? "border-gray-700" : "border-gray-300";
  const textColor = currentTheme === "dark" ? "text-gray-100" : "text-gray-900";
  const labelColor =
    currentTheme === "dark" ? "text-gray-400" : "text-gray-500";
  const valueColor =
    currentTheme === "dark"
      ? "text-white font-medium"
      : "text-gray-800 font-medium";
  const closeButtonHoverBg =
    currentTheme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200";
  const dynamicStyles = {
    top: `${topPosition}px`,
    right: `${popupRightOffsetPx}px`,
    width: `${popupWidthPx}px`,
    maxHeight: `${maxHeightPx}px`,
    zIndex: zIndex,
    overflowY: "auto",
  };
  const scrollbarClasses =
    currentTheme === "dark"
      ? "dark-scrollbar dark-scrollbar-firefox"
      : "light-scrollbar light-scrollbar-firefox";

  const headerButtonText =
    detailData.type === "link"
      ? `Link: ${detailData.sourceNode || "?"} \u2194 ${
          detailData.targetNode || "?"
        }`
      : `${detailData.name || `Item ${detailData.id}`} Details`;

  const handleHeaderButtonClick = () => {
    if (detailData.type === "site" && detailData.navId) {
      // Navigate to the specific site detail page
      navigate(`/sites/site/${detailData.navId}`, {
        // Updated path
        state: { siteData: detailData },
      });
      onClose(); // Close the popup after navigation
    } else if (detailData.type === "link") {
      console.log(
        "Link header clicked, no navigation defined for link headers."
      );
    }
  };

  return (
    <div
      style={dynamicStyles}
      className={`fixed ${popupBgClass} p-6 flex flex-col 
                 transform transition-all duration-300 ease-in-out 
                 border ${popupBorderColorClass} rounded-lg pointer-events-auto
                 ${
                   isOpen
                     ? "translate-x-0 opacity-100"
                     : "translate-x-full opacity-0"
                 }
                 ${scrollbarClasses}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`detail-popup-title-${detailData.id}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-4 shrink-0">
        <button
          id={`detail-popup-title-${detailData.id}`}
          onClick={handleHeaderButtonClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 truncate"
          style={{ maxWidth: "calc(100% - 40px)" }}
          disabled={detailData.type !== "site" || !detailData.navId} // Only enable for sites with navId
        >
          {headerButtonText}
        </button>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-full ${textColor} ${closeButtonHoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            currentTheme === "dark"
              ? "focus:ring-offset-gray-800"
              : "focus:ring-offset-white"
          } focus:ring-blue-500 flex-shrink-0`}
          aria-label="Close details"
        >
          <MdClose size={22} />
        </button>
      </div>

      {/* Content Area (remains the same) */}
      <div className={`flex-1 space-y-4 pr-1 min-h-0 relative pb-1`}>
        {/* ... existing content based on detailData.type ... */}
        {detailData.type === "site" && (
          <>
            <div className="flex space-x-4">
              <DetailItem
                label="Physical Status"
                value={detailData.physicalStatus}
                labelColor={labelColor}
                valueColor={valueColor}
                className="flex-1"
              />
              <DetailItem
                label="Protocol Status"
                value={detailData.protocolStatus}
                labelColor={labelColor}
                valueColor={valueColor}
                className="flex-1"
              />
            </div>
            <DetailItem
              label="OSPF"
              value={detailData.ospfStatus}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="MPLS"
              value={detailData.mplsStatus}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <div className={`flex justify-between items-center pt-0`}>
              <DetailItem
                label="Bandwidth"
                value={detailData.bandwidth}
                labelColor={labelColor}
                valueColor={valueColor}
                className="flex-1"
              />
            </div>
            <div
              id={`additional-details-section-${detailData.id}`}
              className="space-y-4 pt-2"
            >
              <DetailItem
                label="Description"
                value={detailData.description}
                labelColor={labelColor}
                valueColor={valueColor}
              />
              <DetailItem
                label="Media Type"
                value={detailData.mediaType}
                labelColor={labelColor}
                valueColor={valueColor}
              />
              <DetailItem
                label="CDP Neighbors"
                value={detailData.cdpNeighbors}
                labelColor={labelColor}
                valueColor={valueColor}
              />
              <DetailItem
                label="Container Name"
                value={detailData.containerName}
                labelColor={labelColor}
                valueColor={valueColor}
              />
            </div>
          </>
        )}

        {detailData.type === "link" && (
          <>
            <DetailItem
              label="Link ID"
              value={detailData.linkId}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="Source Node"
              value={detailData.sourceNode}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="Target Node"
              value={detailData.targetNode}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="Link Status"
              value={detailData.status}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <div className={`flex justify-between items-center pt-0`}>
              <DetailItem
                label="Link Bandwidth"
                value={detailData.linkBandwidth}
                labelColor={labelColor}
                valueColor={valueColor}
                className="flex-1"
              />
            </div>
            <DetailItem
              label="Latency"
              value={detailData.latency}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <DetailItem
              label="Utilization"
              value={detailData.utilization}
              labelColor={labelColor}
              valueColor={valueColor}
            />
            <div
              id={`additional-details-section-${detailData.id}`}
              className="space-y-4 pt-2"
            >
              <DetailItem
                label="Link Description"
                value={detailData.linkDescription || detailData.name}
                labelColor={labelColor}
                valueColor={valueColor}
              />
              <DetailItem
                label="Interface (Source)"
                value={detailData.sourceInterface}
                labelColor={labelColor}
                valueColor={valueColor}
              />
              <DetailItem
                label="Interface (Target)"
                value={detailData.targetInterface}
                labelColor={labelColor}
                valueColor={valueColor}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
