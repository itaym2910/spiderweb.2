import React, { useState, useEffect } from "react"; // Make sure all necessary imports are here
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
// Import your UI components (Card, Table, Tabs etc.)
import { Card, CardContent } from "./components/ui/card"; // Adjust path if necessary
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "./components/ui/table"; // Adjust path
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs"; // Your custom tabs
// Import your page/visualizer components
import NetworkVisualizerWrapper from "./components/NetworkVisualizerWrapper"; // Adjust path
import NetworkVisualizer5Wrapper from "./components/NetworkVisualizer5Wrapper"; // Adjust path
import CoreSitePage from "./components/CoreSite/CoreSitePage"; // Adjust path
import { data } from "./dataMainLines"; // Adjust path

export function DashboardPage() {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Theme observer logic (keep as is)
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // eslint-disable-next-line no-unused-vars
  const handleTabChange = (newlySelectedTabValue) => {
    // newlySelectedTabValue is not strictly needed by this logic anymore but kept for consistency if your Tabs component passes it
    const currentPath = location.pathname;
    const isOnLZoneDetail = currentPath.includes("/l-zone/");
    const isOnPZoneDetail = currentPath.includes("/p-zone/");

    if (isOnLZoneDetail || isOnPZoneDetail) {
      let calculatedBasePath = currentPath;

      if (isOnLZoneDetail) {
        const parts = currentPath.split("/l-zone/");
        calculatedBasePath = parts[0];
      } else if (isOnPZoneDetail) {
        const parts = currentPath.split("/p-zone/");
        calculatedBasePath = parts[0];
      }

      if (calculatedBasePath === "" || calculatedBasePath === undefined) {
        calculatedBasePath = "/";
      }

      // This check might be redundant if the above logic always produces a valid start,
      // but it's a small safeguard.
      if (!calculatedBasePath.startsWith("/")) {
        calculatedBasePath = "/" + calculatedBasePath;
      }

      if (calculatedBasePath !== currentPath) {
        try {
          navigate(calculatedBasePath);
        } catch (e) {
          // You might still want to log critical errors in a production logging system
          console.error("Navigation error in handleTabChange:", e);
        }
      }
    }
    // No 'else' block needed for navigation if not on a detail page;
    // the tab switch itself will render the new content at the current URL.
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-0 md:p-0 rounded-lg shadow-md">
      <Tabs
        defaultValue="table"
        className="w-full" // This className should now be applied by your custom Tabs
        onValueChange={handleTabChange}
      >
        <TabsList /* ... */>
          <TabsTrigger value="table">Main Lines</TabsTrigger>
          <TabsTrigger value="l_network">L-chart</TabsTrigger>
          <TabsTrigger value="p_network">P-chart</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          {/* ... Table content ... */}
          <Card className="border dark:border-gray-700">
            <CardContent className="overflow-x-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b dark:border-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Phrase + [synonyms]
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Frequency
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Net sentiment
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Total impact
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, i) => (
                    <TableRow
                      key={i}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {item.phrase}{" "}
                        {item.synonyms ? `[${item.synonyms}]` : ""}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {item.frequency}
                      </TableCell>
                      <TableCell
                        className={`text-gray-700 dark:text-gray-300 ${
                          item.sentiment < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {item.sentiment.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-gray-700 dark:text-gray-300 font-semibold ${
                          item.impact < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {item.impact.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="l_network" key="l_network_content">
          <Card className="border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative w-full h-[770px]">
                <Routes>
                  <Route
                    index
                    element={
                      <NetworkVisualizerWrapper data={data} theme={theme} />
                    }
                  />
                  <Route path="l-zone/:zoneId" element={<CoreSitePage />} />
                </Routes>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="p_network" key="p_network_content">
          <Card className="border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative w-full h-[770px]">
                <Routes>
                  <Route
                    index
                    element={
                      <NetworkVisualizer5Wrapper data={data} theme={theme} />
                    }
                  />
                  <Route path="p-zone/:zoneId" element={<CoreSitePage />} />
                </Routes>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
