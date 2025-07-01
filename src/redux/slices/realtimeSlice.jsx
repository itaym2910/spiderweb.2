import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: "disconnected", // 'disconnected' | 'connecting' | 'connected'
};

const realtimeSlice = createSlice({
  name: "realtime",
  initialState,
  reducers: {
    // Action to be dispatched by the UI to initiate the connection.
    // The middleware will intercept this.
    startConnecting: (state) => {
      state.status = "connecting";
    },
    // Action dispatched by the middleware once the connection is established.
    connectionEstablished: (state) => {
      state.status = "connected";
    },
    // Action dispatched by the UI to terminate the connection (e.g., on logout).
    disconnect: (state) => {
      state.status = "disconnected";
    },
  },
});

export const { startConnecting, connectionEstablished, disconnect } =
  realtimeSlice.actions;

export const selectRealtimeStatus = (state) => state.realtime.status;

export default realtimeSlice.reducer;
