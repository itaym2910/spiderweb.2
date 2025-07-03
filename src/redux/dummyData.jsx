import { faker } from "@faker-js/faker";

// --- NEW: Add the mock alert generator here ---
export const generateMockAlerts = () => {
  const alerts = [];
  const now = new Date();
  const types = ["error", "warning", "info"];
  const messages = [
    "Network line Alpha-01 experiencing high latency.",
    "Router Gamma-03 offline.",
    "Firewall policy update successful on Delta-Cluster.",
    "Network segment Beta-West approaching capacity.",
    "Unusual traffic pattern detected from IP 192.168.1.100.",
    "VPN connection dropped for user 'johndoe'.",
    "Server Epsilon-db CPU utilization at 95%.",
    "New device connected: IOT-Sensor-7B on VLAN 10.",
    "Security scan completed: 0 vulnerabilities found.",
    "Backup job 'DailySystemBackup' finished successfully.",
  ];

  // Let's generate a smaller, more dynamic number of alerts each time
  const alertCount = faker.number.int({ min: 1950, max: 2050 });

  for (let i = 0; i < alertCount; i++) {
    const randomMinutesAgo = Math.floor(Math.random() * 7 * 24 * 60 * 1.5);
    alerts.push({
      id: `alert-${i + 1}-${faker.string.uuid()}`, // Use UUID for more unique IDs
      type: types[Math.floor(Math.random() * types.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(now.getTime() - randomMinutesAgo * 60000),
      networkLine: `Line-${String.fromCharCode(65 + Math.floor(i / 10))}-${
        (i % 10) + 1
      }`,
      details: `This is a more detailed description for alert ${
        i + 1
      }. It might include diagnostic information, affected systems, or suggested actions.`,
      source: `SourceSystem-${Math.floor(Math.random() * 5) + 1}`,
      severityScore: Math.floor(Math.random() * 10) + 1,
    });
  }
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
};

// --- 1. ADD DUMMY USERS ARRAY ---
// This array will act as our user database.
const dummyUsers = [
  { username: "admin", password: "password123", role: "admin" },
  { username: "userg", password: "password123", role: "user" },
  { username: "viewer", password: "password", role: "viewer" },
];

// --- Helper to create a number of items ---
const createItems = (creator, count, ...args) => {
  return Array.from({ length: count }, () => creator(...args));
};

// --- Individual Data Generators ---

const createCorePikudim = (typeId) => ({
  id: faker.number.int({ min: 1000, max: 9999 }),
  core_site_name: `Pikud-${faker.location.city()}`,
  type_id: typeId, // Use the provided typeId
  timestamp: faker.date.recent().toISOString(),
});

const createCoreDevice = (pikud, endingNumber) => ({
  id: faker.number.int({ min: 100, max: 999 }),
  // The hostname is now constructed with the provided ending number
  hostname: `rtr-${faker.string.alphanumeric(4)}-${endingNumber}`,
  ip_address: faker.internet.ip(),
  network_type_id: pikud.type_id,
  core_pikudim_site_id: pikud.id,
  timestamp: faker.date.recent().toISOString(),
});

// --- CHANGED ---
// The createSite function is now more flexible.
// It accepts a deviceId and a names object to allow for creating paired sites.
const createSite = (deviceId, siteNames) => ({
  id: faker.number.int({ min: 10000, max: 99999 }),
  interface_id: faker.number.int({ min: 1, max: 48 }),
  device_id: deviceId, // Use the provided deviceId
  site_name_hebrew: siteNames.hebrew, // Use the provided Hebrew name
  site_name_english: siteNames.english, // Use the provided English name
  timestamp: faker.date.recent().toISOString(),
});

const createInterfaceInfo = (deviceId) => ({
  id: faker.number.int({ min: 5000, max: 9999 }),
  name: faker.helpers.arrayElement([
    "GigabitEthernet0/1",
    "TenGigabitEthernet1/0/1",
    "FastEthernet0/24",
  ]),
  core_pikudim_device_id: deviceId,
  media_type: "Fiber",
  description: faker.lorem.sentence(),
  physical_status: faker.helpers.arrayElement(["Up", "Down"]),
  protocol_status: faker.helpers.arrayElement(["Up", "Down"]),
  cdp: `neighbor-switch-${faker.string.alphanumeric(3)}`,
  bandwidth: 10000,
  mtu: 9000,
  ospf: "Enabled",
  mpls: "Enabled",
  crc: faker.number.int({ min: 0, max: 10 }),
  input_data: faker.number.int({ min: 100, max: 900 }),
  output_data: faker.number.int({ min: 100, max: 800 }),
  tx: -faker.number.float({ min: 1, max: 5, precision: 0.1 }),
  rx: -faker.number.float({ min: 1, max: 5, precision: 0.1 }),
  timestamp: faker.date.recent().toISOString(),
});

const createTenGigLink = (sourceDevice, targetDevice) => ({
  id: `link-10g-${faker.string.alphanumeric(8)}`,
  source: sourceDevice.hostname,
  target: targetDevice.hostname,
  network_type_id: sourceDevice.network_type_id,
  ip: faker.internet.ip(),
  bandwidth: faker.helpers.arrayElement(["10Gbps", "40Gbps"]),
  status: faker.helpers.arrayElement(["up", "down", "issue"]),
});

// --- Main Export Function ---

export const generateAllDummyData = () => {
  // --- 1. Generate Pikudim (Core Sites) and Devices ---
  const lChartPikudim = createItems(createCorePikudim, 6, 1);
  const pChartPikudim = createItems(createCorePikudim, 5, 2);
  const corePikudim = [...lChartPikudim, ...pChartPikudim];

  const allowedEndings = [1, 2, 4, 5, 7, 8];
  const coreDevices = corePikudim.flatMap((pikud) => {
    const deviceCount = faker.number.int({ min: 2, max: 6 });
    const devicesForThisPikud = [];
    for (let i = 0; i < deviceCount && i < allowedEndings.length; i++) {
      const endingNumber = allowedEndings[i];
      devicesForThisPikud.push(createCoreDevice(pikud, endingNumber));
    }
    return devicesForThisPikud;
  });

  // --- 2. Group Devices by their Core Site ID ---
  const devicesBySite = new Map();
  for (const device of coreDevices) {
    if (!devicesBySite.has(device.core_pikudim_site_id)) {
      devicesBySite.set(device.core_pikudim_site_id, []);
    }
    devicesBySite.get(device.core_pikudim_site_id).push(device);
  }

  // --- 3. Generate Structured "Same Site" Links ---
  const sameSiteLinks = [];
  const sameSitePairs = [
    [1, 2],
    [1, 4],
    [1, 5],
    [2, 4],
    [2, 5],
    [4, 5],
    [4, 7],
    [4, 8],
    [5, 7],
    [5, 8],
    [7, 8],
  ];

  for (const siteDevices of devicesBySite.values()) {
    const deviceMapByEnding = new Map();
    for (const device of siteDevices) {
      const ending = parseInt(device.hostname.split("-").pop(), 10);
      deviceMapByEnding.set(ending, device);
    }
    for (const [end1, end2] of sameSitePairs) {
      if (deviceMapByEnding.has(end1) && deviceMapByEnding.has(end2)) {
        sameSiteLinks.push(
          createTenGigLink(
            deviceMapByEnding.get(end1),
            deviceMapByEnding.get(end2)
          )
        );
      }
    }
  }

  // --- 4. Generate Random "Different Site" Links ---
  const differentSiteLinks = [];
  const lChartDevices = coreDevices.filter((d) => d.network_type_id === 1);
  const pChartDevices = coreDevices.filter((d) => d.network_type_id === 2);

  const createRandomInterSiteLinks = (deviceList, count) => {
    const createdPairs = new Set();
    for (let i = 0; i < count; i++) {
      if (deviceList.length < 2) break;
      let sourceDevice, targetDevice, pairKey;
      do {
        sourceDevice = faker.helpers.arrayElement(deviceList);
        targetDevice = faker.helpers.arrayElement(deviceList);
        const sortedIds = [sourceDevice.id, targetDevice.id].sort();
        pairKey = `${sortedIds[0]}-${sortedIds[1]}`;
      } while (
        sourceDevice.core_pikudim_site_id ===
          targetDevice.core_pikudim_site_id ||
        createdPairs.has(pairKey)
      );
      differentSiteLinks.push(createTenGigLink(sourceDevice, targetDevice));
      createdPairs.add(pairKey);
    }
  };

  createRandomInterSiteLinks(lChartDevices, 50);
  createRandomInterSiteLinks(pChartDevices, 40);

  const tenGigLinks = [...sameSiteLinks, ...differentSiteLinks];

  // --- 5. Generate Paired Sites (Dual-Homed) ---
  // --- REPLACED LOGIC ---
  const sites = [];
  const numberOfLogicalSites = 250; // The number of conceptual sites to create

  if (coreDevices.length >= 2) {
    for (let i = 0; i < numberOfLogicalSites; i++) {
      // 1. Create a single set of names for the logical site
      const city = faker.location.city();
      const siteNames = {
        hebrew: `אתר ${city}`,
        english: `Site ${city}`,
      };

      // 2. Pick two *different* core devices to connect the site to
      let device1, device2;
      do {
        device1 = faker.helpers.arrayElement(coreDevices);
        device2 = faker.helpers.arrayElement(coreDevices);
      } while (device1.id === device2.id); // Ensure they are not the same device

      // 3. Create two site entries (one for each device) and add to the array
      sites.push(createSite(device1.id, siteNames));
      sites.push(createSite(device2.id, siteNames));
    }
  }

  // --- 6. Finalize Remaining Data ---
  const deviceInfo = coreDevices.reduce((acc, device) => {
    acc[device.id] = createItems(
      createInterfaceInfo,
      faker.number.int({ min: 3, max: 8 }),
      device.id
    );
    return acc;
  }, {});
  const netTypes = [
    { id: 1, name: "L-Chart Network" },
    { id: 2, name: "P-Chart Network" },
  ];

  return {
    corePikudim,
    coreDevices,
    sites,
    deviceInfo,
    netTypes,
    tenGigLinks,
    dummyUsers,
  };
};
