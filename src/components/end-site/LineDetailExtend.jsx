const LinkDetailRow = ({ link, isParentSelectedAndDark }) => {
  const hasAdditionalDetails =
    link.additionalDetails && Object.keys(link.additionalDetails).length > 0;
  const hasRelevantIssueType =
    (link.status === "issue" || link.status === "down") && link.issueType;

  const tdClasses = `relative -left-[4px]`;

  // Determine background based on whether the parent selected row is dark or light
  // This ensures the detail row visually merges with the selected row above it.
  const detailRowBackground = isParentSelectedAndDark
    ? "bg-slate-700"
    : "bg-slate-100";

  // Text colors need to contrast with the detailRowBackground
  const labelTextColor = isParentSelectedAndDark
    ? "text-slate-300"
    : "text-slate-700";
  const valueTextColor = isParentSelectedAndDark
    ? "text-slate-400"
    : "text-slate-600";
  const issueLabelColor = isParentSelectedAndDark
    ? "text-red-400"
    : "text-red-500"; // Adjusted red for better contrast on slate
  const issueValueColor = isParentSelectedAndDark
    ? "text-red-400 font-semibold"
    : "text-red-500 font-semibold";
  const borderColor = isParentSelectedAndDark
    ? "border-slate-600"
    : "border-slate-300";

  if (!hasAdditionalDetails && !hasRelevantIssueType) {
    return (
      <td colSpan="6" className={tdClasses}>
        <div className={`p-4 ${detailRowBackground} text-sm ${valueTextColor}`}>
          {" "}
          {/* Use valueTextColor for consistency */}
          No specific details available for this link.
        </div>
      </td>
    );
  }

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

  const detailItemClass = "py-1"; // Base class for items

  return (
    <td colSpan="6" className={tdClasses}>
      <div
        className={`p-4 ${detailRowBackground} transition-colors duration-150`}
      >
        {hasRelevantIssueType && issueType && (
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
