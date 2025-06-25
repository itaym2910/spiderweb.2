import { faker } from "@faker-js/faker";

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

const createCoreDevice = (pikud) => ({
  id: faker.number.int({ min: 100, max: 999 }),
  hostname: `core-rtr-${faker.string.alphanumeric(4)}`,
  ip_address: faker.internet.ip(),
  // Set network_type_id based on the parent pikud's type_id
  // This makes filtering very easy later.
  network_type_id: pikud.type_id, // 1 for L-chart devices, 2 for P-chart devices
  core_pikudim_site_id: pikud.id,
  timestamp: faker.date.recent().toISOString(),
});

// ... (createSite and createInterfaceInfo remain unchanged) ...
const createSite = (device) => ({
  id: faker.number.int({ min: 10000, max: 99999 }),
  interface_id: faker.number.int({ min: 1, max: 48 }),
  device_id: device.id,
  site_name_hebrew: `אתר ${faker.location.city()}`,
  site_name_english: `Site ${faker.location.city()}`,
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

const createTenGigLink = (allDevices) => {
  let sourceDevice, targetDevice;
  do {
    sourceDevice = faker.helpers.arrayElement(allDevices);
    targetDevice = faker.helpers.arrayElement(allDevices);
  } while (
    sourceDevice.id === targetDevice.id ||
    // Ensure links are only created between devices of the SAME type
    sourceDevice.network_type_id !== targetDevice.network_type_id
  );

  return {
    id: `link-10g-${faker.string.alphanumeric(8)}`,
    source: sourceDevice.hostname,
    target: targetDevice.hostname,
    // Add the network_type_id to the link itself for easy filtering
    network_type_id: sourceDevice.network_type_id,
    ip: faker.internet.ip(),
    bandwidth: faker.helpers.arrayElement(["10Gbps", "40Gbps"]),
    status: faker.helpers.arrayElement(["up", "down", "issue"]),
  };
};

// --- Main Export Function ---

export const generateAllDummyData = () => {
  // Create 6 Pikudim for L-chart (type 1)
  const lChartPikudim = createItems(createCorePikudim, 6, 1);
  // Create 5 Pikudim for P-chart (type 2)
  const pChartPikudim = createItems(createCorePikudim, 5, 2);

  // Combine them into a single list
  const corePikudim = [...lChartPikudim, ...pChartPikudim];

  const coreDevices = corePikudim.flatMap((pikud) =>
    createItems(createCoreDevice, faker.number.int({ min: 2, max: 6 }), pikud)
  );

  const sites = coreDevices.flatMap((device) =>
    createItems(createSite, faker.number.int({ min: 5, max: 10 }), device)
  );

  const deviceInfo = coreDevices.reduce((acc, device) => {
    acc[device.id] = createItems(
      createInterfaceInfo,
      faker.number.int({ min: 3, max: 8 }),
      device.id
    );
    return acc;
  }, {});

  // We need to create links for each network type separately
  const lChartDevices = coreDevices.filter((d) => d.network_type_id === 1);
  const pChartDevices = coreDevices.filter((d) => d.network_type_id === 2);

  // Create links ONLY between devices of the same type
  const lChartLinks = createItems(createTenGigLink, 30, lChartDevices);
  const pChartLinks = createItems(createTenGigLink, 25, pChartDevices);

  // Combine them into a single list
  const tenGigLinks = [...lChartLinks, ...pChartLinks];

  const netTypes = [
    { id: 1, name: "L-Chart Network" },
    { id: 2, name: "P-Chart Network" },
  ];

  return { corePikudim, coreDevices, sites, deviceInfo, netTypes, tenGigLinks };
};
