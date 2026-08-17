import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { initialData } from "../initialData";

import { api } from "../../services/apiServices";

// --- ASYNC THUNK: For fetching the devices and their info ---
export const fetchDevices = createAsyncThunk(
  "devices/fetchDevices",
  async (_, { rejectWithValue }) => {
    try {
      // LATER: When you're ready for the real API, you will change this line to:
      const devices = await api.getCoreDevices();
      return {
        devices: Array.isArray(devices) ? devices : devices?.devices || [],
        deviceInfo: devices?.deviceInfo || {},
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch core devices");
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
    return devices.filter((d) => {
      if (d.network_type_id !== undefined) return d.network_type_id === typeId;
      if (d.type_id !== undefined) return d.type_id === typeId;
      if (Array.isArray(d.network_ids) && d.network_ids.length > 0) {
        return d.network_ids.includes(typeId);
      }
      return true;
    });
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
