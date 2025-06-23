import { useState } from "react";

// --- Data Source ---
// In a real application, this would come from an API call.
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

/**
 * Custom hook to manage network interface data.
 * @returns {{
 *   interfaces: Array<object>,
 *   handleToggleFavorite: Function
 * }}
 */
export function useInterfaceData() {
  const [interfaces, setInterfaces] = useState(allInterfacesData);

  const handleToggleFavorite = (interfaceId) => {
    setInterfaces(
      interfaces.map((iface) =>
        iface.id === interfaceId
          ? { ...iface, isFavorite: !iface.isFavorite }
          : iface
      )
    );
  };

  return { interfaces, handleToggleFavorite };
}
