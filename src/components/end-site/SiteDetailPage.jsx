// src/components/end-site/SiteDetailPage.jsx
// (Adjust path to LinkDetailRow and StatusBulb if necessary)

import React, { useState, useEffect, useMemo } from "react";
import LinkDetailRow from "./LineDetailExtend"; // Path to your LinkDetailRow component
import StatusBulb from "./StatusBulb"; // Path to your StatusBulb component

// Helper function to generate random polygon points for the site topology SVG
const generateRandomPolygonPoints = (
  width,
  height,
  numPoints = 6,
  variance = 0.3
) => {
  const points = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadiusX = (width / 2) * (1 - variance);
  const baseRadiusY = (height / 2) * (1 - variance);

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const randomFactor = 1 - variance + Math.random() * variance * 2;
    const radiusX = baseRadiusX * randomFactor;
    const radiusY = baseRadiusY * randomFactor;
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(" ");
};

// --- STATIC COMMON ADDITIONAL DETAILS TO BE FORCED ONTO EVERY LINK ---
// This is for demonstration/testing purposes to ensure LinkDetailRow shows details.
// In a real application, this data would come from your actual link data.
const commonAdditionalDetails = {
  mediaType: "Fiber Optic (Forced)",
  cdpNeighbors: "EdgeRouter-XYZ (Gi0/1) (Forced)",
  containerName: "LAG-01 (Forced)",
  mtu: "9120 (Forced)",
  crcErrors: "3 (Forced)",
  inputDataRate: "7.8 Gbps (Forced)",
  outputDataRate: "6.2 Gbps (Forced)",
  txPower: "-1.5 dBm (Forced)",
  rxPower: "-1.8 dBm (Forced)",
};

const SiteDetailPage = ({ siteData, initialTheme = "light" }) => {
  // --- STATE HOOKS ---
  const [theme, setTheme] = useState(initialTheme);
  const [expandedLinkId, setExpandedLinkId] = useState(null); // Tracks which link's details are expanded

  // --- EFFECT HOOKS ---

  // Effect to synchronize component theme with global HTML dark mode class
  useEffect(() => {
    const rootHtmlElement = document.documentElement;
    const currentHtmlIsDark = rootHtmlElement.classList.contains("dark");
    const currentGlobalTheme = currentHtmlIsDark ? "dark" : "light";

    if (theme !== currentGlobalTheme) {
      setTheme(currentGlobalTheme);
    }

    const observer = new MutationObserver(() => {
      setTheme(rootHtmlElement.classList.contains("dark") ? "dark" : "light");
    });

    observer.observe(rootHtmlElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [theme]); // Re-run if local 'theme' state changes

  // Debugging: Log the received siteData prop when it changes.
  // Can be removed in production.
  useEffect(() => {
    if (siteData) {
      console.log(
        "SiteDetailPage: Received siteData prop:",
        JSON.stringify(siteData, null, 2)
      );
    } else {
      console.log("SiteDetailPage: siteData prop is null or undefined.");
    }
  }, [siteData]); // Re-run if siteData prop changes

  // --- MEMOIZATION HOOKS ---

  // Memoize polygon points for SVG to prevent re-calculation on every render
  const polygonPoints = useMemo(() => {
    const numVertex = Math.floor(5 + Math.random() * 5); // Random number of vertices (5-9)
    return generateRandomPolygonPoints(200, 150, numVertex);
  }, []); // Empty dependency array: calculate once on component mount

  // Inject the commonAdditionalDetails into each link from siteData.
  // This ensures LinkDetailRow has data to display for `additionalDetails`.
  const connectedLinksWithForcedDetails = useMemo(() => {
    // Safely access siteData.connectedLinks, defaulting to an empty array if siteData or connectedLinks is undefined.
    const originalLinks = siteData?.connectedLinks || [];
    return originalLinks.map((link) => ({
      ...link, // Spread original link properties
      additionalDetails: { ...commonAdditionalDetails }, // Add/overwrite with common details
      // Optionally, force an issueType if the link status warrants it:
      // issueType: (link.status === 'issue' || link.status === 'down')
      //   ? "Forced Issue Description"
      //   : link.issueType,
    }));
  }, [siteData?.connectedLinks]); // Re-calculate if the original connectedLinks array changes

  // --- EARLY RETURN FOR MISSING DATA ---
  // Hooks must be called before this point.
  if (!siteData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-800">
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Loading site data or site not found...
        </p>
      </div>
    );
  }

  // --- DATA DESTRUCTURING (after early return) ---
  // Destructure siteData with defaults now that we know siteData exists.
  const { name = "Unnamed Site", description = "" } = siteData;
  // We will use `connectedLinksWithForcedDetails` for rendering the table.

  // --- DERIVED STATE ---
  const isDark = theme === "dark";

  // --- EVENT HANDLERS ---
  const toggleTheme = () => {
    const rootHtmlElement = document.documentElement;
    if (rootHtmlElement.classList.contains("dark")) {
      rootHtmlElement.classList.remove("dark");
    } else {
      rootHtmlElement.classList.add("dark");
    }
    // The MutationObserver will update the 'theme' state.
  };

  const handleLinkRowClick = (linkId) => {
    setExpandedLinkId((prevId) => (prevId === linkId ? null : linkId));
  };

  // --- JSX RENDER ---
  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen transition-colors duration-300">
      <div className="p-6">
        {/* Header: Site Name and Theme Toggle */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {name}
          </h1>
          <button
            onClick={toggleTheme}
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </header>

        {/* Site Info: Description and Topology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <section className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Site Description
            </h2>
            {description ? (
              <div
                className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 flex-grow overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: description }} // Use with caution if 'description' is not sanitized
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No description available for this site.
              </p>
            )}
          </section>

          <section className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Site Topology
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow flex items-center justify-center flex-grow min-h-[250px]">
              <svg
                viewBox="0 0 200 150"
                className="w-full h-auto max-w-md"
                role="img"
                aria-label={`${name} topology diagram`}
              >
                <title>{`${name} Polygon Shape`}</title>
                <polygon
                  points={polygonPoints}
                  className={`${
                    isDark
                      ? "fill-blue-400 stroke-blue-200"
                      : "fill-blue-500 stroke-blue-700"
                  } stroke-[2] transition-colors`}
                />
                <text
                  x="100"
                  y="75"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`font-semibold text-xs transition-colors ${
                    isDark ? "fill-gray-900" : "fill-white"
                  }`}
                >
                  {name.substring(0, 10)} {/* Show first 10 chars of name */}
                </text>
              </svg>
            </div>
          </section>
        </div>

        {/* Connected Links Table */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Connected Links
          </h2>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    OSPF
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    MPLS
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Bandwidth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {connectedLinksWithForcedDetails &&
                connectedLinksWithForcedDetails.length > 0 ? (
                  connectedLinksWithForcedDetails.flatMap((link) => {
                    // Each 'link' object from 'connectedLinks' MUST have a unique 'id'.
                    if (!link || typeof link.id === "undefined") {
                      console.warn(
                        "SiteDetailPage: Skipping link due to missing or undefined 'id':",
                        link
                      );
                      return null; // Skip rendering invalid link
                    }

                    const isSelected = expandedLinkId === link.id;
                    const selectedRowBg = isDark
                      ? "bg-slate-700"
                      : "bg-slate-100";

                    return (
                      <React.Fragment key={link.id}>
                        <tr
                          className={`hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors ${
                            isSelected ? selectedRowBg : ""
                          }`}
                          onClick={() => handleLinkRowClick(link.id)}
                          aria-expanded={isSelected}
                          aria-controls={`link-details-${link.id}`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBulb status={link.status} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {link.description || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {link.name || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {link.ospfStatus || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {link.mplsStatus || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {link.bandwidth || "N/A"}
                          </td>
                        </tr>
                        {isSelected && (
                          <tr
                            id={`link-details-${link.id}`}
                            className="border-l-4 border-blue-500 dark:border-blue-400"
                          >
                            <LinkDetailRow
                              link={link} // This 'link' object now includes the forced 'additionalDetails'
                              isParentSelectedAndDark={isDark}
                            />
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No connected links found for this site.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SiteDetailPage;
