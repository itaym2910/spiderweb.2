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

// Static common additional details to be forced onto every link
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

// Dummy data for the connected links table
const dummyConnectedLinks = [
  {
    id: "link-dummy-1",
    name: "Core-RTR-01 <> Edge-SW-A",
    description: "Primary 10G Fiber Uplink",
    status: "up",
    ospfStatus: "Full",
    mplsStatus: "Enabled",
    bandwidth: "10 Gbps",
  },
  {
    id: "link-dummy-2",
    name: "Backup-RTR <> ISP-B",
    description: "Secondary 1G Copper Uplink",
    status: "issue",
    ospfStatus: "2-Way",
    mplsStatus: "Disabled",
    bandwidth: "1 Gbps",
  },
];

const SiteDetailPage = ({ siteData, initialTheme = "light" }) => {
  const [theme, setTheme] = useState(initialTheme);
  const [expandedLinkId, setExpandedLinkId] = useState(null);

  // This effect is KEPT to listen for global theme changes from the sidebar
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
  }, [theme]);

  const polygonPoints = useMemo(() => {
    const numVertex = Math.floor(5 + Math.random() * 5);
    return generateRandomPolygonPoints(200, 150, numVertex);
  }, []);

  const connectedLinksWithForcedDetails = useMemo(() => {
    return dummyConnectedLinks.map((link) => ({
      ...link,
      additionalDetails: { ...commonAdditionalDetails },
    }));
  }, []);

  if (!siteData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-800">
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Loading site data or site not found...
        </p>
      </div>
    );
  }

  const { name = "Unnamed Site", description = "" } = siteData;
  const isDark = theme === "dark";

  const handleLinkRowClick = (linkId) => {
    setExpandedLinkId((prevId) => (prevId === linkId ? null : linkId));
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen transition-colors duration-300">
      <div className="p-6">
        {/* Header: Site Name and Theme Toggle */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {name}
          </h1>
          {/* THEME TOGGLE BUTTON HAS BEEN REMOVED FROM HERE */}
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
                dangerouslySetInnerHTML={{ __html: description }}
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
                  {name.substring(0, 10)}
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
                    if (!link || typeof link.id === "undefined") {
                      return null;
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
                              link={link}
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
