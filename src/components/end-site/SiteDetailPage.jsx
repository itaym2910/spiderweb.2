import React, { useState, useEffect, useMemo } from "react";
import LinkDetailRow from "./LineDetailExtend";
import StatusBulb from "./StatusBulb";

// Helper function to generate random polygon points
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

const SiteDetailPage = ({ siteData, initialTheme = "light" }) => {
  const [theme, setTheme] = useState(initialTheme);
  const [expandedLinkId, setExpandedLinkId] = useState(null);

  useEffect(() => {
    const currentHtmlIsDark =
      document.documentElement.classList.contains("dark");
    const currentTheme = currentHtmlIsDark ? "dark" : "light";
    if (theme !== currentTheme) {
      setTheme(currentTheme);
    }

    const observer = new MutationObserver(() => {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [theme]); // Add theme to dependency array to re-sync if prop changes

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    // setTheme(newTheme); // Observer will pick this up
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const isDark = theme === "dark";

  const polygonPoints = useMemo(
    () =>
      generateRandomPolygonPoints(200, 150, Math.floor(5 + Math.random() * 5)),
    []
  );

  if (!siteData) return null;

  const { name, description, connectedLinks = [] } = siteData;

  const handleLinkRowClick = (linkId) => {
    setExpandedLinkId((prevId) => (prevId === linkId ? null : linkId));
  };

  return (
    // This div will automatically get dark mode styles if <html> has .dark class
    // No need for explicit `${isDark ? 'dark' : ''}` here if tailwind.config.js darkMode: 'class'
    <div className="bg-white dark:bg-gray-800 min-h-screen transition-colors duration-300">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {name || "Site Details"}
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

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
                No description available.
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
              >
                <title>{name || "Site"} Polygon</title>
                <polygon
                  points={polygonPoints}
                  className={`${
                    isDark
                      ? "fill-blue-400 stroke-blue-200"
                      : "fill-blue-500 stroke-blue-700"
                  } stroke-[2]`}
                />
                <text
                  x="100"
                  y="75"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`font-semibold text-xs ${
                    isDark ? "fill-gray-900" : "fill-white"
                  }`}
                >
                  {name ? name.substring(0, 10) : "Site"}
                </text>
              </svg>
            </div>
          </section>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Connected Links
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    OSPF
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    MPLS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Bandwidth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {connectedLinks?.length > 0 ? (
                  connectedLinks.flatMap((link) => {
                    const isSelected = expandedLinkId === link.id;
                    const selectedRowBg = isDark
                      ? "bg-slate-700"
                      : "bg-slate-100";

                    return (
                      <React.Fragment key={link.id}>
                        <tr
                          className={`hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                            isSelected ? selectedRowBg : ""
                          }`}
                          onClick={() => handleLinkRowClick(link.id)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBulb status={link.status} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {link.description}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {link.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {link.ospfStatus || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {link.mplsStatus || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {link.bandwidth}
                          </td>
                        </tr>
                        {isSelected && (
                          <tr className="border-l-4 border-blue-500 dark:border-blue-400">
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
                      No connected links.
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
