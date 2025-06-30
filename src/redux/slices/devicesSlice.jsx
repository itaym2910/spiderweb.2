import { createSlice, createSelector } from "@reduxjs/toolkit";
import { initialData } from "../initialData";

const { coreDevices, deviceInfo } = initialData;

const devicesSlice = createSlice({
  name: "devices",
  initialState: {
    items: coreDevices,
    deviceInfo: deviceInfo,
    status: "idle",
  },
  // [THE FIX] - Add the missing reducers here.
  reducers: {
    addCoreDevice: (state, action) => {
      // Adds a new device to the items array.
      state.items.push(action.payload);
    },
    deleteCoreDevice: (state, action) => {
      // Filters the items array, removing the device with the matching ID.
      // The `action.payload` will be the ID of the device to delete.
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    // You can add other reducers here if needed, like 'refreshInterfacesForDevice'
    // refreshInterfacesForDevice: (state, action) => {
    //   // ... logic for refreshing interfaces
    // }
  },
});

// [THE FIX] - Export the newly created actions with the correct names.
// Note: The original export had `deleteDevice`, but the import in AdminPanelPage
// was `deleteCoreDevice`. We'll use `deleteCoreDevice` for consistency.
export const { addCoreDevice, deleteCoreDevice } = devicesSlice.actions;

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
