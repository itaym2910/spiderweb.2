import { createSlice } from "@reduxjs/toolkit";
import { generateAllDummyData } from "../dummyData";

const { coreDevices, deviceInfo } = generateAllDummyData();

const devicesSlice = createSlice({
  name: "devices",
  initialState: {
    items: coreDevices,
    deviceInfo: deviceInfo, // Store detailed interface info here
    status: "idle",
  },
  reducers: {
    addCoreDevice: (state, action) => {
      state.items.push(action.payload);
    },
    deleteDevice: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      delete state.deviceInfo[action.payload]; // Also remove its detailed info
    },
    // This simulates the refresh action
    refreshInterfacesForDevice: (state, action) => {
      const deviceId = action.payload;
      // In a real app, you'd fetch. Here, we can just log it.
      console.log(`Simulating refresh for device: ${deviceId}`);
    },
  },
});

export const { addCoreDevice, deleteDevice, refreshInterfacesForDevice } =
  devicesSlice.actions;
export default devicesSlice.reducer;
