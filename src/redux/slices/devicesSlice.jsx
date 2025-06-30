import { createSlice, createSelector } from "@reduxjs/toolkit"; // Import createSelector
import { initialData } from "../initialData";

const { coreDevices, deviceInfo } = initialData;

const devicesSlice = createSlice({
  name: "devices",
  initialState: {
    items: coreDevices,
    deviceInfo: deviceInfo,
    status: "idle",
  },
  // ... rest of the slice is unchanged
  reducers: {
    // ...
  },
});

export const { addCoreDevice, deleteDevice, refreshInterfacesForDevice } =
  devicesSlice.actions;

// --- Selectors ---

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

export default devicesSlice.reducer;
