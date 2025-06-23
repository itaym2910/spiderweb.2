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

const createTenGigLink = () => ({
  id: `link-10g-${faker.string.alphanumeric(8)}`,
  source: `core-rtr-${faker.location.cityAbbr()}`,
  target: `dist-sw-${faker.string.alphanumeric(4)}`,
  ip: faker.internet.ip(),
  // The endpoint name implies 10G, so we'll make the data match that.
  bandwidth: faker.helpers.arrayElement(["10Gbps", "40Gbps"]),
  // Use a more descriptive status for the UI
  status: faker.helpers.arrayElement(["active", "inactive", "error"]),
});

// --- Main Export Function ---

export const generateAllDummyData = () => {
  const corePikudim = createItems(createCorePikudim, 5);

  const coreDevices = corePikudim.flatMap((pikud) =>
    createItems(createCoreDevice, faker.number.int({ min: 2, max: 4 }), pikud)
  );

  const sites = coreDevices.flatMap((device) =>
    createItems(createSite, faker.number.int({ min: 5, max: 10 }), device)
  );

  // A map of deviceId to its list of interfaces
  const deviceInfo = coreDevices.reduce((acc, device) => {
    acc[device.id] = createItems(
      createInterfaceInfo,
      faker.number.int({ min: 3, max: 8 }),
      device.id
    );
    return acc;
  }, {});

  const tenGigLinks = createItems(createTenGigLink, 25);

  const netTypes = [
    { id: 1, name: "L-Chart Network" },
    { id: 2, name: "P-Chart Network" },
    { id: 3, name: "Management" },
  ];

  return { corePikudim, coreDevices, sites, deviceInfo, netTypes, tenGigLinks };
};
