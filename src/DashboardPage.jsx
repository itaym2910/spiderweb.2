import { useEffect, useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import NetworkVisualizer from "./components/chart/NetworkVisualizer";
import NetworkVisualizer5 from "./components/chart/NetworkVisualizer5";
import { MainLinesPage } from "./FavLines"; // Import the MainLinesPage

// The 'data' array is no longer defined here.
// It has been moved into MainLinesPage.jsx

export function DashboardPage() {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => { // Corrected line: removed the rogue underscore
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // ... rest of the component
  const visualizerData = [
    { phrase: "Sample Node 1", frequency: 10, impact: 5, sentiment: 0.5 },
    { phrase: "Sample Node 2", frequency: 20, impact: -10, sentiment: -0.8 },
  ];

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
            Libot
          </TabsTrigger>
          <TabsTrigger
            value="p_network"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
          >
            Pikudim
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <MainLinesPage />
        </TabsContent>
        <TabsContent value="l_network">
          <Card className="border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative w-full h-[770px]">
                <NetworkVisualizer data={visualizerData} theme={theme} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="p_network">
          <Card className="border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative w-full h-[770px]">
                <NetworkVisualizer5 data={visualizerData} theme={theme} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}