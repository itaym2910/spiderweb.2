import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/apiServices";

// --- ASYNC THUNK: Fetch the unified core topology ---
export const fetchCoreTopology = createAsyncThunk(
  "coreTopology/fetchCoreTopology",
  async (_, { rejectWithValue }) => {
    try {
      // Fetch core topology and detailed links concurrently
      const [topoResponse, linksResponse] = await Promise.all([
        api.getCoreTopology(),
        api.getLinksTopology().catch(() => []) // Fallback to empty if it fails
      ]);

      // Create a map of detailed links by ID for fast lookup
      const detailedLinksMap = new Map();
      if (Array.isArray(linksResponse)) {
        linksResponse.forEach(link => {
          if (link && link.id) {
            detailedLinksMap.set(link.id, link);
          }
        });
      }

      // Merge the detailed link data into the core topology devices
      if (topoResponse && topoResponse.devices) {
        topoResponse.devices.forEach(device => {
          if (device.links) {
            device.links = device.links.map(topoLink => {
              const detailedLink = detailedLinksMap.get(topoLink.id);
              if (detailedLink) {
                // Priority: Use core-topology description if it exists, otherwise use links description
                const finalDescription = topoLink.description || detailedLink.description || "Core backbone fiber link";
                return {
                  ...topoLink,
                  ...detailedLink, // detailed fields like tx, rx, media_type overwrite
                  description: finalDescription
                };
              }
              return topoLink;
            });
          }
        });
      }

      return topoResponse;
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
