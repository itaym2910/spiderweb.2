import axios from "axios";

// --- Configuration ---
// It's best practice to store the base URL in an environment variable.
// For example, in a .env file: VITE_API_URL=http://localhost:5000/api
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// --- Create a Centralized Axios Instance ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Axios Interceptor for Authentication ---
// This function will run before every request is sent.
// It retrieves the token from localStorage and adds it to the request headers.
apiClient.interceptors.request.use(
  (config) => {
    // You would typically get the token after a user logs in.
    const token = localStorage.getItem("authToken");
    if (token) {
      // The standard way to send a token is with the "Bearer" prefix.
      // Adjust if your backend expects something different.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request configuration errors
    return Promise.reject(error);
  }
);

// --- API Functions ---

/**
 * A helper function to handle API calls and potential errors.
 * It also unnests the data if it's wrapped in a 'response' key, as your specs show.
 * @param {Promise} request - The axios request promise.
 * @param {boolean} [isDataWrapped=true] - Whether the successful response data is inside a "response" key.
 * @returns {Promise<any>} The response data.
 */
const handleApiCall = async (request, isDataWrapped = true) => {
  try {
    const response = await request;
    // Your API specs often have the data nested under a "response" key.
    if (isDataWrapped && response.data && response.data.response) {
      return response.data.response;
    }
    // For APIs that return data at the top level (like get_ten_gig_links).
    return response.data;
  } catch (error) {
    // Log the error for debugging and re-throw it so the calling component can handle it.
    console.error("API call failed:", error.response || error.message);
    throw error;
  }
};

export const api = {
  // --- GET Endpoints ---

  /**
   * Fetches all 10-Gigabit links.
   * @returns {Promise<Array<object>>} A list of link objects.
   */
  getTenGigLinks: () =>
    handleApiCall(apiClient.get("/get_ten_gig_links"), false),

  /**
   * Fetches all core pikudim (core sites).
   * @returns {Promise<Array<object>>} A list of core pikudim objects.
   */
  getCorePikudim: () => handleApiCall(apiClient.get("/get_core_pikudim")),

  /**
   * Fetches all core devices, grouped by core site name.
   * @returns {Promise<object>} An object where keys are site names and values are lists of devices.
   */
  getCoreDevices: () => handleApiCall(apiClient.get("/get_core_devices")),

  /**
   * Fetches all end-user sites.
   * @returns {Promise<Array<object>>} A list of site objects.
   */
  getSites: () => handleApiCall(apiClient.get("/get_sites")),

  /**
   * Fetches detailed interface information for a specific device.
   * @param {string|number} deviceId - The ID of the device.
   * @returns {Promise<Array<object>>} A list of interface info objects for the device.
   */
  getDeviceInfo: (deviceId) =>
    handleApiCall(apiClient.get(`/get_device_info/${deviceId}`)),

  /**
   * Fetches all devices belonging to a specific core pikud.
   * @param {string|number} corePikudimId - The ID of the core pikud.
   * @returns {Promise<Array<object>>} A list of device objects.
   */
  getDevicesByCorePikudim: (corePikudimId) =>
    handleApiCall(
      apiClient.get(`/get_devices_by_core_pikudim/${corePikudimId}`)
    ),

  /**
   * Fetches WAN connection data. (Placeholder - implement based on actual response)
   * @returns {Promise<any>}
   */
  getWanConnection: () => handleApiCall(apiClient.get("/get-wan-connection")),

  /**
   * Fetches bandwidth information for a specific site.
   * @param {string} siteName - The English or Hebrew name of the site.
   * @returns {Promise<any>} Bandwidth data.
   */
  getSiteBandwidth: (siteName) =>
    handleApiCall(apiClient.get(`/get_site_bw/${siteName}`)),

  /**
   * Fetches the status of interfaces for a given site.
   * @param {string} siteName - The English or Hebrew name of the site.
   * @returns {Promise<any>} Interface status data.
   */
  getInterfacesUp: (siteName) =>
    handleApiCall(apiClient.get(`/get_interfaces_up/${siteName}`)),

  // --- POST/ADD Endpoints ---

  /**
   * Adds a new core pikud.
   * @param {object} pikudData - The data for the new pikud (e.g., { core_site_name: 'Pikud-Haifa', type_id: 1 }).
   * @returns {Promise<object>} The newly created pikud object.
   */
  addCorePikudim: (pikudData) =>
    handleApiCall(apiClient.post("/add_core_pikudim", pikudData)),

  /**
   * Adds a new core device.
   * @param {object} deviceData - The data for the new device.
   * @returns {Promise<object>} The newly created device object.
   */
  addCoreDevice: (deviceData) =>
    handleApiCall(apiClient.post("/add_core_device", deviceData)),

  /**
   * Adds a new network type.
   * @param {object} netTypeData - The data for the new network type (e.g., { name: 'New-Network' }).
   * @returns {Promise<object>} The newly created network type object.
   */
  addNetType: (netTypeData) =>
    handleApiCall(apiClient.post("/add_net_type", netTypeData)),

  // --- DELETE Endpoints ---

  /**
   * Deletes a core pikud by its ID.
   * @param {string|number} corePikudimId - The ID of the pikud to delete.
   * @returns {Promise<object>} The confirmation response from the server.
   */
  deleteCorePikudim: (corePikudimId) =>
    handleApiCall(apiClient.delete(`/delete_core_pikudim/${corePikudimId}`)),

  /**
   * Deletes a device by its ID.
   * @param {string|number} deviceId - The ID of the device to delete.
   * @returns {Promise<object>} The confirmation response from the server.
   */
  deleteDevice: (deviceId) =>
    handleApiCall(apiClient.delete(`/delete_device/${deviceId}`)),

  /**
   * Deletes a network type by its ID.
   * @param {string|number} netTypeId - The ID of the network type to delete.
   * @returns {Promise<object>} The confirmation response from the server.
   */
  deleteNetType: (netTypeId) =>
    handleApiCall(apiClient.delete(`/delete_net_type/${netTypeId}`)),

  // --- Action/Refresh Endpoints (Assuming POST) ---

  /**
   * Triggers a refresh of all interfaces for a specific device.
   * @param {string|number} deviceId - The ID of the device to refresh.
   * @returns {Promise<object>} The confirmation/status response from the server.
   */
  refreshInterfacesPerDevice: (deviceId) =>
    handleApiCall(apiClient.post(`/refresh_interfaces_per_device/${deviceId}`)),

  /**
   * Triggers a refresh for a single interface.
   * NOTE: The endpoint name is generic; assuming it needs an ID.
   * @param {string|number} interfaceId - The ID of the interface to refresh.
   * @returns {Promise<object>} The confirmation/status response from the server.
   */
  refreshInterface: (interfaceId) =>
    handleApiCall(apiClient.post(`/refresh_interface/${interfaceId}`)),
};
