// src/DashboardPage.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { Star, ArrowUp, ArrowDown, XCircle } from "lucide-react"; // Added icons
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
import NetworkVisualizerWrapper from "./components/NetworkVisualizerWrapper";
import NetworkVisualizer5Wrapper from "./components/NetworkVisualizer5Wrapper";
import CoreSitePage from "./components/CoreSite/CoreSitePage";

// --- 1. NEW DATA SOURCE ---
// Replaced the old 'dataMainLines' with the network interface data.
const allInterfacesData = [
  {
    id: "cr01-gi1/0/1",
    deviceName: "core-router-01",
    interfaceName: "GigabitEthernet1/0/1",
    description: "Uplink to ISP-A (Primary)",
    status: "Up",
    trafficIn: "850 Mbps",
    trafficOut: "620 Mbps",
    errors: { in: 0, out: 0 },
    isFavorite: true,
  },
  {
    id: "asw01-fa0/24",
    deviceName: "access-switch-01",
    interfaceName: "FastEthernet0/24",
    description: "Connection to Marketing Dept Printer",
    status: "Down",
    trafficIn: "0 Mbps",
    trafficOut: "0 Mbps",
    errors: { in: 0, out: 0 },
    isFavorite: false,
  },
  {
    id: "dsw01-te1/0/1",
    deviceName: "dist-switch-01",
    interfaceName: "TenGigabitEthernet1/0/1",
    description: "Trunk to Core Router",
    status: "Up",
    trafficIn: "1.2 Gbps",
    trafficOut: "980 Mbps",
    errors: { in: 14, out: 3 },
    isFavorite: true,
  },
  {
    id: "fw01-eth1",
    deviceName: "firewall-cluster-a",
    interfaceName: "ethernet1/1",
    description: "DMZ Zone Link",
    status: "Up",
    trafficIn: "340 Mbps",
    trafficOut: "450 Mbps",
    errors: { in: 0, out: 0 },
    isFavorite: false,
  },
];

// --- 2. HELPER COMPONENT for status visualization ---
function StatusIndicator({ status }) {
  const statusConfig = {
    Up: { color: "text-green-500", Icon: ArrowUp, label: "Up" },
    Down: { color: "text-red-500", Icon: ArrowDown, label: "Down" },
    "Admin Down": { color: "text-gray-500", Icon: XCircle, label: "Admin Down" },
  };
  const config = statusConfig[status] || statusConfig["Admin Down"];
  return (
    <div className={`flex items-center gap-2 font-medium ${config.color}`}>
      <config.Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
}

export function DashboardPage({ isAppFullscreen, isSidebarCollapsed }) {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  // Use state to hold the interface data
  const [interfaces, setInterfaces] = useState(allInterfacesData);
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
    // This logic might need adjustment depending on your routing for the new tabs
    const currentPath = location.pathname;
    const isOnLZoneDetail = currentPath.includes("/l-zone/");
    const isOnPZoneDetail = currentPath.includes("/p-zone/");

    if (isOnLZoneDetail || isOnPZoneDetail) {
      // Navigate back to the base path when switching tabs away from a detail view
      const parts = currentPath.split(isOnLZoneDetail ? "/l-zone/" : "/p-zone/");
      let calculatedBasePath = parts[0] || "/";
      if (!calculatedBasePath.startsWith("/")) {
        calculatedBasePath = "/" + calculatedBasePath;
      }
      navigate(calculatedBasePath);
    }
  };

  const chartKeySuffix = `${isAppFullscreen}-${isSidebarCollapsed}`;
  const favoriteInterfaces = interfaces.filter((iface) => iface.isFavorite);

  return (
    <div
      className={`flex flex-col h-full p-0 ${
        isAppFullscreen
          ? "bg-white dark:bg-gray-800"
          : "bg-white dark:bg-gray-800 rounded-lg shadow-md"
      }`}
    >
      <Tabs
        defaultValue="favorites" // Default to the new Favorites tab
        className="w-full flex flex-col flex-1"
        onValueChange={handleTabChange}
      >
        <TabsList
          className={`bg-gray-100 dark:bg-gray-700 p-1 rounded-lg ${
            isAppFullscreen ? "mx-0 my-0 rounded-none" : "mb-4"
          }`}
        >
          {/* --- 3. NEW FAVORITES TAB --- */}
          <TabsTrigger value="favorites" className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" /> Favorites
          </TabsTrigger>
          <TabsTrigger value="all_interfaces">All Interfaces</TabsTrigger>
          <TabsTrigger value="l_network">L-chart</TabsTrigger>
          <TabsTrigger value="p_network">P-chart</TabsTrigger>
        </TabsList>

        {/* --- 4. FAVORITES TAB CONTENT --- */}
        <TabsContent value="favorites" className="flex-1 flex flex-col min-h-0">
          <Card
            className={`flex-1 flex flex-col min-h-0 ${
              isAppFullscreen
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`overflow-auto flex-1 ${
                isAppFullscreen ? "p-0" : "p-4"
              }`}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Interface</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Traffic (In / Out)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {favoriteInterfaces.length > 0 ? (
                    favoriteInterfaces.map((iface) => (
                      <TableRow key={iface.id}>
                        <TableCell>
                          <div className="font-medium">{iface.interfaceName}</div>
                          <div className="text-sm text-gray-500">{iface.description}</div>
                        </TableCell>
                        <TableCell>{iface.deviceName}</TableCell>
                        <TableCell><StatusIndicator status={iface.status} /></TableCell>
                        <TableCell>{`${iface.trafficIn} / ${iface.trafficOut}`}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No favorite interfaces selected.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 5. UPDATED "ALL INTERFACES" TAB (formerly Main Lines) --- */}
        <TabsContent value="all_interfaces" className="flex-1 flex flex-col min-h-0">
          <Card
            className={`flex-1 flex flex-col min-h-0 ${
              isAppFullscreen
                ? "border-0 rounded-none shadow-none"
                : "border dark:border-gray-700"
            }`}
          >
            <CardContent
              className={`overflow-auto flex-1 ${
                isAppFullscreen ? "p-0" : "p-4"
              }`}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Interface</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Traffic (In / Out)</TableHead>
                    <TableHead>Errors (In / Out)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interfaces.map((iface) => (
                    <TableRow key={iface.id}>
                      <TableCell>
                        <div className="font-medium">{iface.interfaceName}</div>
                        <div className="text-sm text-gray-500">{iface.description}</div>
                      </TableCell>
                      <TableCell>{iface.deviceName}</TableCell>
                      <TableCell><StatusIndicator status={iface.status} /></TableCell>
                      <TableCell>{`${iface.trafficIn} / ${iface.trafficOut}`}</TableCell>
                      <TableCell
                        className={
                          iface.errors.in > 0 || iface.errors.out > 0
                            ? "font-bold text-orange-600 dark:text-orange-400"
                            : ""
                        }
                      >
                        {`${iface.errors.in} / ${iface.errors.out}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Other tabs remain unchanged --- */}
        <TabsContent value="l_network" className="flex-1 flex flex-col min-h-0">
          <Card className={`flex-1 flex flex-col min-h-0 ${isAppFullscreen ? "border-0" : ""}`}>
            <CardContent className={`flex-1 flex flex-col min-h-0 ${isAppFullscreen ? "p-0" : "p-4"}`}>
              <div className="relative w-full flex-1 min-h-0">
                <Routes>
                  <Route index element={<NetworkVisualizerWrapper key={`l-visualizer-${chartKeySuffix}`} data={interfaces} theme={theme} />} />
                  <Route path="l-zone/:zoneId" element={<CoreSitePage theme={theme} />} />
                </Routes>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="p_network" className="flex-1 flex flex-col min-h-0">
          <Card className={`flex-1 flex flex-col min-h-0 ${isAppFullscreen ? "border-0" : ""}`}>
            <CardContent className={`flex-1 flex flex-col min-h-0 ${isAppFullscreen ? "p-0" : "p-4"}`}>
              <div className="relative w-full flex-1 min-h-0">
                <Routes>
                  <Route index element={<NetworkVisualizer5Wrapper key={`p-visualizer-${chartKeySuffix}`} data={interfaces} theme={theme} />} />
                  <Route path="p-zone/:zoneId" element={<CoreSitePage theme={theme} />} />
                </Routes>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}