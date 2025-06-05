import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "./components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "./components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import NetworkVisualizerWrapper from "./components/NetworkVisualizerWrapper"; // Ensure this path is correct
import NetworkVisualizer5Wrapper from "./components/NetworkVisualizer5Wrapper";
import CoreSitePage from "./components/CoreSite/CoreSitePage"; // Ensure this path is correct
import { data } from "./dataMainLines";

export function DashboardPage() {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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

  const handleTabChange = (newlySelectedTabValue) => {
    const currentPath = location.pathname;
    const isOnLZoneDetail = currentPath.includes("/l-zone/");
    const isOnPZoneDetail = currentPath.includes("/p-zone/");

    console.log(
      `------------------------------------------------------\n` +
        `[handleTabChange] START\n` +
        `  New Tab Value: ${newlySelectedTabValue}\n` +
        `  Current Path (location.pathname): ${currentPath}\n` +
        `  Is on L-Zone Detail: ${isOnLZoneDetail}\n` +
        `  Is on P-Zone Detail: ${isOnPZoneDetail}`
    );

    if (isOnLZoneDetail || isOnPZoneDetail) {
      let calculatedBasePath = currentPath; // Start with current path

      if (isOnLZoneDetail) {
        const parts = currentPath.split("/l-zone/");
        calculatedBasePath = parts[0];
        console.log(
          `  L-Zone detected. Path parts: ${JSON.stringify(
            parts
          )}. Base part: ${calculatedBasePath}`
        );
      } else if (isOnPZoneDetail) {
        const parts = currentPath.split("/p-zone/");
        calculatedBasePath = parts[0];
        console.log(
          `  P-Zone detected. Path parts: ${JSON.stringify(
            parts
          )}. Base part: ${calculatedBasePath}`
        );
      }

      // If splitting resulted in an empty string, DashboardPage is at the root.
      // Or if the original path was just "/l-zone/" (no ID), parts[0] would be ""
      if (calculatedBasePath === "" || calculatedBasePath === undefined) {
        calculatedBasePath = "/";
        console.log(
          `  Calculated base path was empty or undefined, defaulting to "/"`
        );
      }
      // Ensure it's a valid path, at least "/"
      if (!calculatedBasePath.startsWith("/")) {
        calculatedBasePath = "/" + calculatedBasePath; // Should not happen if logic is right
      }

      console.log(
        `  Final Calculated Base Path to navigate to: "${calculatedBasePath}"`
      );

      if (calculatedBasePath === currentPath) {
        console.warn(
          `  WARNING: Attempting to navigate to the SAME path: "${currentPath}". No navigation will occur by router.`
        );
      } else {
        console.log(`  ATTEMPTING NAVIGATION to: "${calculatedBasePath}"`);
        try {
          navigate(calculatedBasePath);
          // NOTE: The URL change might not be reflected in `location.pathname` immediately in this same function call.
          // It will trigger a re-render where `location.pathname` will be updated.
          console.log(`  navigate("${calculatedBasePath}") CALLED.`);
        } catch (e) {
          console.error(`  ERROR during navigate call:`, e);
        }
      }
    } else {
      console.log(
        `  Not on a zone detail page. No special navigation by handleTabChange.`
      );
    }
    console.log(
      `[handleTabChange] END\n------------------------------------------------------`
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-0 md:p-0 rounded-lg shadow-md">
      <Tabs
        defaultValue="table"
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
          >
            Main Lines
          </TabsTrigger>
          <TabsTrigger
            value="l_network"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
          >
            L-chart
          </TabsTrigger>
          <TabsTrigger
            value="p_network"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
          >
            P-chart
          </TabsTrigger>
        </TabsList>

        {/* Tab Content for "Main Lines" */}
        <TabsContent value="table">
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
                  {/* Add a prefix for L-chart zones */}
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
                  {/* Add a prefix for P-chart zones */}
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
