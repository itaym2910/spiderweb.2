import { createSlice } from "@reduxjs/toolkit";
// Import from the new central file
import { initialData } from "../initialData";

// Use the pre-generated data
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
export const selectAllDevices = (state) => state.devices.items;
export const selectDeviceInfo = (state) => state.devices.deviceInfo;
export default devicesSlice.reducer;
