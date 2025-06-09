import { useState } from "react";
import { Star, ArrowUp, ArrowDown, XCircle } from "lucide-react"; // npm install lucide-react
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

// --- Data Source ---
// In a real application, this would come from an API call.
// We keep the full list here to simulate filtering.
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
    isFavorite: true, // This interface is a favorite
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
    isFavorite: false, // Not a favorite
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
    isFavorite: true, // This interface is a favorite
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
    isFavorite: false, // Not a favorite
  },
];

// --- Status Indicator Component (reusable and helpful) ---
function StatusIndicator({ status }) {
  const statusConfig = {
    Up: {
      color: "text-green-500",
      Icon: ArrowUp,
      label: "Up",
    },
    Down: {
      color: "text-red-500",
      Icon: ArrowDown,
      label: "Down",
    },
    "Admin Down": {
      color: "text-gray-500",
      Icon: XCircle,
      label: "Admin Down",
    },
  };

  const config = statusConfig[status] || statusConfig["Admin Down"];

  return (
    <div className={`flex items-center gap-2 font-medium ${config.color}`}>
      <config.Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
}

// --- The Main Page Component ---
// This component now ONLY displays the favorite interfaces.
export function FavoriteInterfacesPage() {
  // We use state to hold the data, which would be populated from an API in a real app
  const [interfaces, setInterfaces] = useState(allInterfacesData);

  // Filter the data source to get only the favorited items
  const favoriteInterfaces = interfaces.filter((iface) => iface.isFavorite);

  // Handle the case where no favorites are selected
  if (favoriteInterfaces.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Favorite Network Interfaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 dark:text-gray-400">
              You have not selected any favorite interfaces.
            </p>
            <p className="mt-2 text-center text-sm text-gray-400 dark:text-gray-500">
              Go to the main dashboard to mark interfaces as favorites.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the table of favorite interfaces
  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Favorite Network Interfaces
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-4">
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
              {favoriteInterfaces.map((iface) => (
                <TableRow key={iface.id}>
                  <TableCell>
                    <div className="font-medium">{iface.interfaceName}</div>
                    <div className="text-sm text-gray-500">{iface.description}</div>
                  </TableCell>
                  <TableCell>{iface.deviceName}</TableCell>
                  <TableCell>
                    <StatusIndicator status={iface.status} />
                  </TableCell>
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
    </div>
  );
}