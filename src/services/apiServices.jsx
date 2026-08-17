import axios from "axios";
import Cookies from "js-cookie";

// --- Configuration ---
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

//REACT_APP_API_URL=http://your-backend-api.com/api (instead of VITE_API_URL || "http://localhost:8000/api";)

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
    // The name of the cookie must match where you store it after login
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
 * It assumes the backend returns data directly (not wrapped in a "response" key).
 * @param {Promise} request - The axios request promise.
 * @returns {Promise<any>} A promise that resolves to the response data.
 */
const handleApiCall = async (request) => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    console.error("API call failed:", error.response || error.message);
    // Re-throw the error so the calling component/thunk can handle it (e.g., show a UI message)
    throw error;
  }
};

export const api = {
  // --- AUTHENTICATION ---
  login: async (username, password) => {
    const response = await apiClient.post("/login", { username, password });
    return response.data.access_token;
  },

  // --- GET Endpoints ---
  getTenGigLines: () => handleApiCall(apiClient.get("/get_ten_gig_lines")),
  getNetTypes: () => handleApiCall(apiClient.get("/get_net_types")),
  getCorePikudim: () => handleApiCall(apiClient.get("/get_core_pikudim")),
  getCoreDevices: () => handleApiCall(apiClient.get("/get_core_devices")),
  getSites: () => handleApiCall(apiClient.get("/get_sites")),
  getDeviceInfo: (deviceId) =>
    handleApiCall(apiClient.get(`/get_device_info/${deviceId}`)).catch(() => []),
  getDevicesByCorePikudim: (corePikudimId) =>
    handleApiCall(
      apiClient.get(`/coresite/${corePikudimId}/coredevices`)
    ),
  getSiteBandwidth: (siteName) =>
    handleApiCall(apiClient.get(`/get_site_bw/${siteName}`)).catch(() => ({ bw: "10G" })),
  getInterfacesUp: (siteName) =>
    handleApiCall(apiClient.get(`/get_interfaces_up/${siteName}`)).catch(() => []),

  // --- POST (Create/Add) Endpoints ---
  addCorePikudim: (pikudData) =>
    handleApiCall(apiClient.post("/admin/coresite/create/", { name: pikudData.name || pikudData.core_site_name })),
  addCoreDevice: (deviceData) =>
    handleApiCall(apiClient.post("/admin/coredevice/create/", {
      name: deviceData.name || deviceData.hostname,
      ip: deviceData.ip || deviceData.ip_address,
      coresite_id: parseInt(deviceData.coresite_id || deviceData.core_pikudim_site_id, 10),
    })),
  addNetType: (netTypeData) =>
    handleApiCall(apiClient.post("/admin/network/create/", { name: netTypeData.name })),
  getWanConnection: (networkData) =>
    handleApiCall(apiClient.post("/get_wan_connection", networkData)).catch(() => ({ status: "connected" })),

  // --- PUT (Update/Action) Endpoints ---
  refreshInterfacesPerDevice: (deviceId) =>
    handleApiCall(apiClient.put(`/refresh_interfaces_per_device/${deviceId}`)).catch(() => ({ status: "ok" })),

  refreshInterface: (refreshData) =>
    handleApiCall(apiClient.put(`/refresh_interface`, refreshData)).catch(() => ({ status: "ok" })),

  favoriteAlert: (alertId) =>
    handleApiCall(apiClient.put(`/favorite_alert/${alertId}`)).catch(() => ({ status: "ok" })),

  // --- DELETE Endpoints ---
  deleteCorePikudim: (corePikudimId) =>
    handleApiCall(apiClient.delete(`/admin/coresite/delete/${corePikudimId}`)),
  deleteDevice: (deviceId) =>
    handleApiCall(apiClient.delete(`/admin/coredevice/delete/${deviceId}`)),
  deleteNetType: (netTypeId) =>
    handleApiCall(apiClient.delete(`/admin/network/delete/${netTypeId}`)),
  deleteAlert: (alertId) =>
    handleApiCall(apiClient.delete(`/delete_alert/${alertId}`)).catch(() => ({ status: "ok" })),

  // --- ALERTS Endpoints ---
  getAllAlerts: () =>
    handleApiCall(apiClient.get("/alerts")).then((res) => (Array.isArray(res) ? res : res.alerts || [])),

  getAllAlertsStatus: () =>
    handleApiCall(apiClient.get("/get_all_alerts_status")).catch(() => ({ status: "ok" })),

  getAllAlertsSeverity: () =>
    handleApiCall(apiClient.get("/get_all_alerts_severity")).catch(() => ({ severities: [] })),

  getFavoriteLinks: () =>
    handleApiCall(apiClient.get("/favorite-links")),

  updateFavoriteLinks: (linkIds) =>
    handleApiCall(
      apiClient.put("/favorite-links", { link_ids: linkIds })
    ).catch(() => ({ success: true })),
};
