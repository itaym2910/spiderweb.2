import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/apiServices";

// --- ASYNC THUNK: Fetch the unified core topology ---
export const fetchCoreTopology = createAsyncThunk(
  "coreTopology/fetchCoreTopology",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getCoreTopology();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch core topology"
      );
    }
  }
);

// --- The Slice Definition ---
const coreTopologySlice = createSlice({
  name: "coreTopology",
  initialState: {
    devices: [],
    generatedAt: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoreTopology.pending, (state) => {
        if (state.devices.length === 0) {
          state.status = "loading";
        }
        state.error = null;
      })
      .addCase(fetchCoreTopology.fulfilled, (state, action) => {
        state.status = "succeeded";
        const payload = action.payload || {};
        state.devices = Array.isArray(payload.devices)
          ? payload.devices
          : Array.isArray(payload.data?.devices)
          ? payload.data.devices
          : [];
        state.generatedAt = payload.generated_at || payload.data?.generated_at || null;
      })
      .addCase(fetchCoreTopology.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// --- Export Selectors ---
export const selectTopologyDevices = (state) => state.coreTopology.devices;
export const selectTopologyGeneratedAt = (state) => state.coreTopology.generatedAt;
export const selectTopologyStatus = (state) => state.coreTopology.status;
export const selectTopologyError = (state) => state.coreTopology.error;

// --- Export Reducer ---
export default coreTopologySlice.reducer;
