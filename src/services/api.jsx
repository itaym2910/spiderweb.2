import axios from "axios";
import Cookies from "js-cookie";

// --- Configuration ---
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
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API Helper Function ---
/**
 * A helper function to handle API calls and potential errors.
 * It unnests the data if it's wrapped in a 'response' key.
 * @param {Promise} request - The axios request promise.
 * @param {boolean} [isDataWrapped=true] - Whether the successful response data is inside a "response" key.
 * @returns {Promise<any>} A promise that resolves to the response data.
 */
const handleApiCall = async (request, isDataWrapped = true) => {
  try {
    const response = await request;
    if (isDataWrapped && response.data && response.data.response) {
      return response.data.response;
    }
    return response.data;
  } catch (error) {
    console.error("API call failed:", error.response || error.message);
    throw error;
  }
};

export const api = {
  // --- AUTHENTICATION ---

  /**
   * Attempts to log in a user with the provided credentials.
   * On success, it returns the authentication token. If it fails, the promise will reject.
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   * @returns {Promise<string>} The authentication token.
   */
  login: async (username, password) => {
    // This is the streamlined version. No try/catch is needed here
    // because the calling function (the Redux thunk) is responsible for handling the error.
    const response = await apiClient.post("/login", { username, password });
    return response.data.token;
  },

  // --- GET Endpoints ---

  /**
   * Fetches all 10-Gigabit links.
   * @returns {Promise<Array<object>>} A promise that resolves to a list of link objects.
   */
  getTenGigLinks: () =>
    handleApiCall(apiClient.get("/get_ten_gig_links"), false),

  /**
   * Fetches all core pikudim (core sites).
   * @returns {Promise<Array<object>>} A promise that resolves to a list of core pikudim objects.
   */
  getCorePikudim: () => handleApiCall(apiClient.get("/get_core_pikudim")),

  /**
   * Fetches all core devices, grouped by core site name.
   * @returns {Promise<object>} A promise that resolves to an object where keys are site names and values are lists of devices.
   */
  getCoreDevices: () => handleApiCall(apiClient.get("/get_core_devices")),

  /**
   * Fetches all end-user sites.
   * @returns {Promise<Array<object>>} A promise that resolves to a list of site objects.
   */
  getSites: () => handleApiCall(apiClient.get("/get_sites")),

  /**
   * Fetches detailed interface information for a specific device.
   * @param {string|number} deviceId - The ID of the device.
   * @returns {Promise<Array<object>>} A promise that resolves to a list of interface info objects for the device.
   */
  getDeviceInfo: (deviceId) =>
    handleApiCall(apiClient.get(`/get_device_info/${deviceId}`)),

  /**
   * Fetches all devices belonging to a specific core pikud.
   * @param {string|number} corePikudimId - The ID of the core pikud.
   * @returns {Promise<Array<object>>} A promise that resolves to a list of device objects.
   */
  getDevicesByCorePikudim: (corePikudimId) =>
    handleApiCall(
      apiClient.get(`/get_devices_by_core_pikudim/${corePikudimId}`)
    ),

  /**
   * Fetches WAN connection data.
   * @returns {Promise<any>} A promise that resolves to the WAN connection data.
   */
  getWanConnection: () => handleApiCall(apiClient.get("/get-wan-connection")),

  /**
   * Fetches bandwidth information for a specific site.
   * @param {string} siteName - The English or Hebrew name of the site.
   * @returns {Promise<any>} A promise that resolves to the bandwidth data.
   */
  getSiteBandwidth: (siteName) =>
    handleApiCall(apiClient.get(`/get_site_bw/${siteName}`)),

  /**
   * Fetches the status of interfaces for a given site.
   * @param {string} siteName - The English or Hebrew name of the site.
   * @returns {Promise<any>} A promise that resolves to the interface status data.
   */
  getInterfacesUp: (siteName) =>
    handleApiCall(apiClient.get(`/get_interfaces_up/${siteName}`)),

  // --- POST/ADD Endpoints ---

  /**
   * Adds a new core pikud.
   * @param {object} pikudData - The data for the new pikud (e.g., { core_site_name: 'Pikud-Haifa', type_id: 1 }).
   * @returns {Promise<object>} A promise that resolves to the newly created pikud object.
   */
  addCorePikudim: (pikudData) =>
    handleApiCall(apiClient.post("/add_core_pikudim", pikudData)),

  /**
   * Adds a new core device.
   * @param {object} deviceData - The data for the new device.
   * @returns {Promise<object>} A promise that resolves to the newly created device object.
   */
  addCoreDevice: (deviceData) =>
    handleApiCall(apiClient.post("/add_core_device", deviceData)),

  /**
   * Adds a new network type.
   * @param {object} netTypeData - The data for the new network type (e.g., { name: 'New-Network' }).
   * @returns {Promise<object>} A promise that resolves to the newly created network type object.
   */
  addNetType: (netTypeData) =>
    handleApiCall(apiClient.post("/add_net_type", netTypeData)),

  // --- DELETE Endpoints ---

  /**
   * Deletes a core pikud by its ID.
   * @param {string|number} corePikudimId - The ID of the pikud to delete.
   * @returns {Promise<object>} A promise that resolves to the confirmation response from the server.
   */
  deleteCorePikudim: (corePikudimId) =>
    handleApiCall(apiClient.delete(`/delete_core_pikudim/${corePikudimId}`)),

  /**
   * Deletes a device by its ID.
   * @param {string|number} deviceId - The ID of the device to delete.
   * @returns {Promise<object>} A promise that resolves to the confirmation response from the server.
   */
  deleteDevice: (deviceId) =>
    handleApiCall(apiClient.delete(`/delete_device/${deviceId}`)),

  /**
   * Deletes a network type by its ID.
   * @param {string|number} netTypeId - The ID of the network type to delete.
   * @returns {Promise<object>} A promise that resolves to the confirmation response from the server.
   */
  deleteNetType: (netTypeId) =>
    handleApiCall(apiClient.delete(`/delete_net_type/${netTypeId}`)),

  // --- Action/Refresh Endpoints (Assuming POST) ---

  /**
   * Triggers a refresh of all interfaces for a specific device.
   * @param {string|number} deviceId - The ID of the device to refresh.
   * @returns {Promise<object>} A promise that resolves to the confirmation/status response from the server.
   */
  refreshInterfacesPerDevice: (deviceId) =>
    handleApiCall(apiClient.post(`/refresh_interfaces_per_device/${deviceId}`)),

  /**
   * Triggers a refresh for a single interface.
   * @param {string|number} interfaceId - The ID of the interface to refresh.
   * @returns {Promise<object>} A promise that resolves to the confirmation/status response from the server.
   */
  refreshInterface: (interfaceId) =>
    handleApiCall(apiClient.post(`/refresh_interface/${interfaceId}`)),
};
