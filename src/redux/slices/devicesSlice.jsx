// src/redux/slices/devicesSlice.js

import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { initialData } from "../initialData";

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

// --- MEMOIZED SELECTOR ---
const selectDeviceItems = (state) => state.devices.items;
const selectTypeIdFromDevice = (state, typeId) => typeId;

export const selectDevicesByTypeId = createSelector(
  [selectDeviceItems, selectTypeIdFromDevice],
  (devices, typeId) => {
    if (!typeId) return [];
    return devices.filter((d) => d.network_type_id === typeId);
  }
);

// --- Export Reducer ---
export default devicesSlice.reducer;
