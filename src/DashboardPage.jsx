import { useEffect, useState } from "react";
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
import NetworkVisualizer from "./components/chart/NetworkVisualizer";
import NetworkVisualizer5 from "./components/chart/NetworkVisualizer5";
import { data } from "./dataMainLines";

export function DashboardPage() {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

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

  return (
    <div className="bg-white dark:bg-gray-800 p-0 md:p-0 rounded-lg shadow-md">
      <Tabs defaultValue="table" className="w-full">
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
        <TabsContent value="l_network">
          <Card className="border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative w-full h-[770px]">
                <NetworkVisualizer data={data} theme={theme} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="p_network">
          <Card className="border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative w-full h-[770px]">
                <NetworkVisualizer5 data={data} theme={theme} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
