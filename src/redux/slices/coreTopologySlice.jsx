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
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCoreTopology.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.devices = action.payload.devices || [];
        state.generatedAt = action.payload.generated_at || null;
      })
      .addCase(fetchCoreTopology.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// --- Export Selectors ---
export const selectTopologyDevices = (state) => state.coreTopology.devices;
export const selectTopologyStatus = (state) => state.coreTopology.status;
export const selectTopologyError = (state) => state.coreTopology.error;

// --- Export Reducer ---
export default coreTopologySlice.reducer;
