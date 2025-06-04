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
import NetworkVisualizer5 from "./components/chart/NetworkVisualizer5"; // Ensure this path is correct
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

  const handleTabChange = (value) => {
    // If navigating away from a sub-route (like /zone/..), reset to the tab's base.
    // This handles both L-chart and P-chart if they use similar sub-route patterns.
    if (
      !["l_network", "p_network"].includes(value) &&
      location.pathname.includes("/zone/")
    ) {
      navigate("."); // Navigate to the current base path for DashboardPage
    } else if (
      value === "l_network" &&
      location.pathname.includes("/p_network_base_for_example/zone/")
    ) {
      // If you had distinct base paths for L and P chart routes, you'd handle that here
      // For now, assuming `navigate('zone/...')` is relative to the current tab's implicit base.
    } else if (
      value === "p_network" &&
      location.pathname.includes("/l_network_base_for_example/zone/")
    ) {
      // similar to above
    }
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

        {/* Tab Content for "L-chart" - THIS IS THE CORRECT ONE */}
        <TabsContent value="l_network">
          {/* Add a Card and sizing div similar to P-chart */}
          <Card className="border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative w-full h-[770px]">
                {" "}
                {/* This provides size and position:relative */}
                <Routes>
                  <Route
                    index
                    element={
                      <NetworkVisualizerWrapper data={data} theme={theme} />
                    }
                  />
                  <Route path="zone/:zoneId" element={<CoreSitePage />} />
                </Routes>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="p_network">
          <Card className="border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative w-full h-[770px]">
                {/* Routes for content within the P-chart tab */}
                <Routes>
                  <Route
                    index
                    element={
                      <NetworkVisualizer5Wrapper data={data} theme={theme} />
                    }
                  />

                  <Route path="zone/:zoneId" element={<CoreSitePage />} />
                </Routes>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
