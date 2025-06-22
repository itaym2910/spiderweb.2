// LinkDetailRow.jsx
import React from "react";

const LinkDetailRow = ({ link, isParentSelectedAndDark }) => {
  // --- Check 1: Does the link object exist at all? ---
  // This should ideally be handled before even calling LinkDetailRow,
  // but a defensive check here is okay.
  if (!link) {
    // This case should ideally not happen if LinkTable filters correctly
    // or if the link object is guaranteed to exist when this component is rendered.
    return (
      <td colSpan="6" className="relative -left-[4px]">
        <div
          className={`p-4 bg-gray-100 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400`}
        >
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

  // Debugging logs (you can remove these once the issue is resolved)
  // console.log(`Link ID: ${link.id}, Status: ${link.status}, IssueType: ${link.issueType}, HasIssueType: ${hasRelevantIssueType}`);
  // console.log(`Link ID: ${link.id}, AdditionalDetails: ${JSON.stringify(link.additionalDetails)}, HasAdditionalDetails: ${hasAdditionalDetails}`);

  const tdClasses = `relative -left-[4px]`;

  const detailRowBackground = isParentSelectedAndDark
    ? "bg-slate-700"
    : "bg-slate-100";
  const valueTextColorForNoDetails = isParentSelectedAndDark
    ? "text-slate-400"
    : "text-slate-600";

  if (!hasAdditionalDetails && !hasRelevantIssueType) {
    return (
      <td colSpan="6" className={tdClasses}>
        <div
          className={`p-4 ${detailRowBackground} text-sm ${valueTextColorForNoDetails}`}
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
  } = link.additionalDetails || {}; // Default to empty object if additionalDetails is null/undefined

  const issueType = link.issueType || null; // Use null if not present, will be handled by hasRelevantIssueType

  const labelTextColor = isParentSelectedAndDark
    ? "text-slate-300"
    : "text-slate-700";
  const valueTextColor = isParentSelectedAndDark
    ? "text-slate-400"
    : "text-slate-600";
  const issueLabelColor = isParentSelectedAndDark
    ? "text-red-400"
    : "text-red-500";
  const issueValueColor = isParentSelectedAndDark
    ? "text-red-400 font-semibold"
    : "text-red-500 font-semibold";
  const borderColor = isParentSelectedAndDark
    ? "border-slate-600"
    : "border-slate-300";
  const detailItemClass = "py-1";

  return (
    <td colSpan="6" className={tdClasses}>
      <div
        className={`p-4 ${detailRowBackground} transition-colors duration-150`}
      >
        {hasRelevantIssueType &&
          issueType && ( // issueType check is redundant due to hasRelevantIssueType but harmless
            <div
              className={`${detailItemClass} mb-3 border-b ${borderColor} pb-2`}
            >
              <span className={`font-medium ${issueLabelColor}`}>
                Issue Type:
              </span>{" "}
              <span className={issueValueColor}>{issueType}</span>
            </div>
          )}
        {hasAdditionalDetails && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
            <div className={detailItemClass}>
              <span className={`font-medium ${labelTextColor}`}>
                Media Type:
              </span>{" "}
              <span className={valueTextColor}>{mediaType}</span>
            </div>
            {/* ... other detail items ... */}
            <div className={detailItemClass}>
              <span className={`font-medium ${labelTextColor}`}>
                CDP Neighbors:
              </span>{" "}
              <span className={valueTextColor}>{cdpNeighbors}</span>
            </div>
            <div className={detailItemClass}>
              <span className={`font-medium ${labelTextColor}`}>
                Container:
              </span>{" "}
              <span className={valueTextColor}>{containerName}</span>
            </div>
            <div className={detailItemClass}>
              <span className={`font-medium ${labelTextColor}`}>MTU:</span>{" "}
              <span className={valueTextColor}>{mtu}</span>
            </div>
            <div className={detailItemClass}>
              <span className={`font-medium ${labelTextColor}`}>
                CRC Errors:
              </span>{" "}
              <span className={valueTextColor}>{crcErrors}</span>
            </div>
            <div className={detailItemClass}>
              <span className={`font-medium ${labelTextColor}`}>
                Input Rate:
              </span>{" "}
              <span className={valueTextColor}>{inputDataRate}</span>
            </div>
            <div className={detailItemClass}>
              <span className={`font-medium ${labelTextColor}`}>
                Output Rate:
              </span>{" "}
              <span className={valueTextColor}>{outputDataRate}</span>
            </div>
            <div className={detailItemClass}>
              <span className={`font-medium ${labelTextColor}`}>Tx Power:</span>{" "}
              <span className={valueTextColor}>{txPower}</span>
            </div>
            <div className={detailItemClass}>
              <span className={`font-medium ${labelTextColor}`}>Rx Power:</span>{" "}
              <span className={valueTextColor}>{rxPower}</span>
            </div>
          </div>
        )}
      </div>
    </td>
  );
};

export default LinkDetailRow;
