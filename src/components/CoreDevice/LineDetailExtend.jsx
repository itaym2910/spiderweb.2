// LinkDetailRow.jsx
import React from "react";

const LinkDetailRow = ({ link, isParentSelectedAndDark }) => {
  // --- Check 1: Does the link object exist at all? ---
  if (!link) {
    return (
      <td colSpan="7" className="relative">
        <div className="p-4 m-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
          Error: Link data missing.
        </div>
      </td>
    );
  }

  // --- Check 2: Determine if there's any content to display ---
  const hasAdditionalDetails =
    link.additionalDetails &&
    typeof link.additionalDetails === "object" &&
    Object.keys(link.additionalDetails).length > 0;
  const hasRelevantIssueType =
    (link.status === "issue" || link.status === "down") &&
    typeof link.issueType === "string" &&
    link.issueType.trim() !== "";

  const detailBg = isParentSelectedAndDark
    ? "bg-slate-800/50"
    : "bg-gray-50";
  const borderLeft = isParentSelectedAndDark
    ? "border-l-blue-400"
    : "border-l-blue-500";

  if (!hasAdditionalDetails && !hasRelevantIssueType) {
    return (
      <td colSpan="7" className="relative">
        <div
          className={`p-4 mx-2 mb-2 rounded-lg ${detailBg} border-l-4 ${borderLeft} text-sm text-gray-500 dark:text-gray-400`}
        >
          No specific details available for this link.
        </div>
      </td>
    );
  }

  // --- Proceed if there is content to display ---
  const {
    mediaType = "N/A",
    cdpNeighbors = "N/A",
    containerName = "N/A",
    mtu = "N/A",
    crcErrors = "N/A",
    inputDataRate = "N/A",
    outputDataRate = "N/A",
    txPower = "N/A",
    rxPower = "N/A",
  } = link.additionalDetails || {};

  const issueType = link.issueType || null;

  const labelColor = isParentSelectedAndDark
    ? "text-gray-400"
    : "text-gray-500";
  const valueColor = isParentSelectedAndDark
    ? "text-gray-200"
    : "text-gray-800";

  const DetailItem = ({ label, value, highlight = false }) => (
    <div className="flex flex-col gap-0.5 py-1.5">
      <span className={`text-[10px] font-medium uppercase tracking-wider ${labelColor}`}>
        {label}
      </span>
      <span
        className={`text-sm font-medium ${highlight
            ? "text-red-500 dark:text-red-400"
            : valueColor
          }`}
      >
        {value}
      </span>
    </div>
  );

  return (
    <td colSpan="7" className="relative">
      <div
        className={`mx-2 mb-2 p-4 rounded-lg ${detailBg} border-l-4 ${borderLeft} transition-colors duration-150`}
      >
        {hasRelevantIssueType && issueType && (
          <div className="mb-3 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Issue Type
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
              {issueType}
            </p>
          </div>
        )}
        {hasAdditionalDetails && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-1">
            <DetailItem label="Media Type" value={mediaType} />
            <DetailItem label="Container" value={containerName} />
            <DetailItem label="MTU" value={mtu} />
            <DetailItem
              label="CRC Errors"
              value={crcErrors}
              highlight={crcErrors !== "N/A" && crcErrors !== 0 && crcErrors !== "0"}
            />
            <DetailItem label="Input Rate" value={inputDataRate} />
            <DetailItem label="Output Rate" value={outputDataRate} />
            <DetailItem label="Tx Power" value={txPower} />
            <DetailItem label="Rx Power" value={rxPower} />
          </div>
        )}
      </div>
    </td>
  );
};

export default LinkDetailRow;
