import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { initialData } from "../initialData";

//import { api } from "../../services/apiServices"; // <-- 1. Import the real api

// --- MOCK API: Mimics the real API call using dummy data ---
// This isolates the data source, preparing it for the real API.
const mockApi = {
  getCoreDevices: async () => {
    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 250));

    // The real API might return devices and deviceInfo separately.
    // For this mock, we'll bundle them to populate the initial state easily.
    return {
      devices: initialData.coreDevices,
      deviceInfo: initialData.deviceInfo,
    };
  },
};

// --- ASYNC THUNK: For fetching the devices and their info ---
export const fetchDevices = createAsyncThunk(
  "devices/fetchDevices",
  async (_, { rejectWithValue }) => {
    try {
      // LATER: When you're ready for the real API, you will change this line to:
      // const response = await api.getCoreDevices();
      // And you might need another call for deviceInfo if it's a separate endpoint.
      const response = await mockApi.getCoreDevices();
      return response;

      // Step 1: Fetch the list of all core devices
      //const devices = await api.getCoreDevices();

      /*// Step 2: For each device, fetch its detailed interface info
      const deviceInfoPromises = devices.map(device =>
        api.getDeviceInfo(device.id)
      );
      const allDeviceInfoArrays = await Promise.all(deviceInfoPromises);
      
      // Step 3: Combine the device info arrays into a single map object
      const deviceInfo = allDeviceInfoArrays.reduce((acc, infoArray, index) => {
        const deviceId = devices[index].id;
        acc[deviceId] = infoArray;
        return acc;
      }, {});

      // Step 4: Return the combined payload, matching the slice's expected shape
      return { devices, deviceInfo };*/
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- The Slice Definition ---
const devicesSlice = createSlice({
  name: "devices",
  initialState: {
    items: [], // Start with an empty array for the device list
    deviceInfo: {}, // Start with an empty object for device info
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  // Reducers for synchronous, direct state mutations
  reducers: {
    addCoreDevice: (state, action) => {
      state.items.push(action.payload);
    },
    deleteCoreDevice: (state, action) => {
      const deviceIdToDelete = action.payload;
      state.items = state.items.filter((item) => item.id !== deviceIdToDelete);
    },
  },
  // extraReducers handle the lifecycle of the async thunk
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Populate the state with the fetched data
        state.items = action.payload.devices;
        state.deviceInfo = action.payload.deviceInfo;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Get error message from rejectWithValue
      });
  },
});

// --- Export Actions ---
export const { addCoreDevice, deleteCoreDevice } = devicesSlice.actions;

// --- Export Selectors ---

export const selectAllDevices = (state) => state.devices.items;
export const selectDeviceInfo = (state) => state.devices.deviceInfo;

// --- MEMOIZED SELECTOR for filtering devices ---
const selectDeviceItems = (state) => state.devices.items;
const selectTypeIdFromDevice = (state, typeId) => typeId;

export const selectDevicesByTypeId = createSelector(
  [selectDeviceItems, selectTypeIdFromDevice],
  (devices, typeId) => {
    if (!typeId) return [];
    return devices.filter((d) => d.network_type_id === typeId);
  }
);

// --- MEMOIZED SELECTOR for the loading/error status ---
// This selector solves the "returned a different result" warning.
// It combines `status` and `error` into a single object, but only creates a
// new object if `status` or `error` themselves have actually changed.

// 1. Input selectors: These grab the raw data without creating new references.
const selectStatus = (state) => state.devices.status;
const selectError = (state) => state.devices.error;

// 2. Memoized Selector: This is the one to use in your components.
export const selectCoreDataStatus = createSelector(
  [selectStatus, selectError], // An array of the input selectors
  (status, error) => ({
    // The "result" function that creates the object
    status,
    error,
  })
);

// --- Export Reducer ---
export default devicesSlice.reducer;
