import { faker } from "@faker-js/faker";

// --- Helper to create a number of items ---
const createItems = (creator, count, ...args) => {
  return Array.from({ length: count }, () => creator(...args));
};

// --- Individual Data Generators ---

const createCorePikudim = () => ({
  id: faker.number.int({ min: 1000, max: 9999 }),
  core_site_name: `Pikud-${faker.location.city()}`,
  type_id: faker.helpers.arrayElement([1, 2]), // 1 for 'L', 2 for 'P'
  timestamp: faker.date.recent().toISOString(),
});

const createCoreDevice = (pikudim) => ({
  id: faker.number.int({ min: 100, max: 999 }),
  hostname: `core-rtr-${faker.string.alphanumeric(4)}`,
  ip_address: faker.internet.ip(),
  network_type_id: faker.helpers.arrayElement([1, 2, 3]),
  core_pikudim_site_id: pikudim.id,
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

// MODIFIED: This function now accepts the list of devices to create valid links
const createTenGigLink = (allDevices) => {
  // Pick two different random devices
  let sourceDevice, targetDevice;
  do {
    sourceDevice = faker.helpers.arrayElement(allDevices);
    targetDevice = faker.helpers.arrayElement(allDevices);
  } while (sourceDevice.id === targetDevice.id);

  return {
    id: `link-10g-${faker.string.alphanumeric(8)}`,
    // Use the hostnames from the actual devices
    source: sourceDevice.hostname,
    target: targetDevice.hostname,
    ip: faker.internet.ip(),
    bandwidth: faker.helpers.arrayElement(["10Gbps", "40Gbps"]),
    // Map the status to the categories the visualizer expects ('up', 'down', 'issue')
    status: faker.helpers.arrayElement(["up", "down", "issue"]),
  };
};

// --- Main Export Function ---

export const generateAllDummyData = () => {
  const corePikudim = createItems(createCorePikudim, 6);

  const coreDevices = corePikudim.flatMap((pikud) =>
    createItems(createCoreDevice, faker.number.int({ min: 2, max: 4 }), pikud)
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

  // MODIFIED: Pass the generated coreDevices to the link creator
  const tenGigLinks = createItems(createTenGigLink, 25, coreDevices);

  const netTypes = [
    { id: 1, name: "L-Chart Network" },
    { id: 2, name: "P-Chart Network" },
    { id: 3, name: "Management" },
  ];

  return { corePikudim, coreDevices, sites, deviceInfo, netTypes, tenGigLinks };
};
