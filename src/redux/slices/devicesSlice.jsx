import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
// --- 1. Import your REAL API service and the logout action ---
import { api } from "../../services/apiService"; // Adjust path if needed
import { logout } from "./authSlice"; // Import logout to reset state

// Define the initial state structure for clarity and reuse
const initialState = {
  items: [], // Holds the list of core devices
  deviceInfo: {}, // Holds detailed info for devices, keyed by device ID
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// --- ASYNC THUNKS ---

// Thunk for fetching initial data
export const fetchDevices = createAsyncThunk(
  "devices/fetchDevices",
  async (_, { rejectWithValue }) => {
    try {
      // This now calls the real API.
      // We assume getCoreDevices returns the list and getDeviceInfo is separate.
      // For simplicity, we'll fetch both, though you might fetch deviceInfo on demand.
      const devices = await api.getCoreDevices();
      // In a real app, you might fetch info for specific devices as needed,
      // but for this example, we'll assume we don't fetch all info at once.
      return devices; // The thunk now returns only the device list
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk for ADDING a new device
export const addCoreDevice = createAsyncThunk(
  "devices/addCoreDevice",
  async (deviceData, { rejectWithValue }) => {
    try {
      // 1. Call the API to create the device on the server
      const newDevice = await api.addCoreDevice(deviceData);
      // 2. Return the new device object from the server (it will have the final ID)
      return newDevice;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk for DELETING a device
export const deleteCoreDevice = createAsyncThunk(
  "devices/deleteCoreDevice",
  async (deviceId, { rejectWithValue }) => {
    try {
      // 1. Call the API to delete the device on the server
      await api.deleteDevice(deviceId);
      // 2. Return the ID of the device that was successfully deleted
      return deviceId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- The Slice Definition ---
const devicesSlice = createSlice({
  name: "devices",
  initialState,
  // Synchronous reducers are removed from here as they are now async thunks.
  // You could keep reducers for purely client-side state changes if needed.
  reducers: {},
  // extraReducers handle actions from outside the slice, including our thunks
  extraReducers: (builder) => {
    builder
      // --- Cases for fetching devices ---
      .addCase(fetchDevices.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload; // Populate the device list
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Cases for adding a device ---
      .addCase(addCoreDevice.fulfilled, (state, action) => {
        // Add the new device returned from the API to the state
        state.items.push(action.payload);
      })
      // You can also add .pending and .rejected cases for addCoreDevice
      // to show loading spinners or error messages on the form.

      // --- Cases for deleting a device ---
      .addCase(deleteCoreDevice.fulfilled, (state, action) => {
        const deletedDeviceId = action.payload;
        // Filter out the deleted device from the state
        state.items = state.items.filter((item) => item.id !== deletedDeviceId);
      })
      // You can also add .pending and .rejected cases for deleteCoreDevice.

      // --- Case for handling user logout ---
      .addCase(logout, () => {
        // When the user logs out, reset this slice to its initial state
        return initialState;
      });
  },
});

// --- Export Actions (No synchronous actions to export from here now) ---
// Note: The async thunks (fetchDevices, addCoreDevice, etc.) are exported directly.

// --- Export Selectors ---
export const selectAllDevices = (state) => state.devices.items;
export const selectDeviceInfo = (state) => state.devices.deviceInfo;

// Memoized selector for filtering devices by network type ID
const selectDeviceItems = (state) => state.devices.items;
const selectTypeIdFromDevice = (state, typeId) => typeId;

export const selectDevicesByTypeId = createSelector(
  [selectDeviceItems, selectTypeIdFromDevice],
  (devices, typeId) => {
    if (!typeId) return [];
    return devices.filter((d) => d.network_type_id === typeId);
  }
);

// Memoized selector for the loading/error status of the slice
const selectStatus = (state) => state.devices.status;
const selectError = (state) => state.devices.error;

export const selectDevicesStatus = createSelector(
  [selectStatus, selectError],
  (status, error) => ({ status, error })
);

// --- Export Reducer ---
export default devicesSlice.reducer;
