import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/apiServices";

// --- Async Thunk: Fetch traffic for a single Core Site ---
export const fetchCoreSiteTraffic = createAsyncThunk(
  "coreSiteTraffic/fetchCoreSiteTraffic",
  async (coreSiteId, { rejectWithValue }) => {
    try {
      const response = await api.getCoreSiteTraffic(coreSiteId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || `Failed to fetch traffic for core site ${coreSiteId}`
      );
    }
  }
);

// --- Async Thunk: Fetch traffic for multiple Core Sites in parallel ---
export const fetchAllCoreSitesTraffic = createAsyncThunk(
  "coreSiteTraffic/fetchAllCoreSitesTraffic",
  async (siteIds, { dispatch, rejectWithValue }) => {
    try {
      const results = await Promise.all(
        siteIds.map((id) =>
          api
            .getCoreSiteTraffic(id)
            .then((res) => ({ id, ...res }))
            .catch((err) => {
              console.warn(`Traffic endpoint unavailable for site ${id}:`, err);
              return { id, traffic: null, error: err.message || "Traffic endpoint unavailable" };
            })
        )
      );
      return results;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch all core sites traffic"
      );
    }
  }
);

// --- Slice Definition ---
const coreSiteTrafficSlice = createSlice({
  name: "coreSiteTraffic",
  initialState: {
    byId: {}, // { [siteId]: { id, traffic: { in, out } } }
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    lastUpdated: null,
    error: null,
  },
  reducers: {
    updateTrafficManual: (state, action) => {
      const payload = action.payload;
      if (payload && payload.id) {
        state.byId[payload.id] = payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Single site fetch
      .addCase(fetchCoreSiteTraffic.fulfilled, (state, action) => {
        if (action.payload && action.payload.id !== undefined) {
          state.byId[action.payload.id] = action.payload;
          state.status = "succeeded";
          state.lastUpdated = new Date().toISOString();
        }
      })
      .addCase(fetchCoreSiteTraffic.rejected, (state, action) => {
        state.error = action.payload;
        const siteId = action.meta?.arg;
        if (siteId && state.byId[siteId]) {
          state.byId[siteId] = { ...state.byId[siteId], traffic: null };
        }
      })
      // Multiple sites batch fetch
      .addCase(fetchAllCoreSitesTraffic.pending, (state) => {
        if (Object.keys(state.byId).length === 0) {
          state.status = "loading";
        }
      })
      .addCase(fetchAllCoreSitesTraffic.fulfilled, (state, action) => {
        state.status = "succeeded";
        action.payload.forEach((siteTraffic) => {
          if (siteTraffic && siteTraffic.id !== undefined) {
            state.byId[siteTraffic.id] = siteTraffic;
          }
        });
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAllCoreSitesTraffic.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        // When traffic fetch completely fails, clear traffic so UI hides stale metrics
        Object.keys(state.byId).forEach((id) => {
          if (state.byId[id]) {
            state.byId[id] = { ...state.byId[id], traffic: null };
          }
        });
      });
  },
});

export const { updateTrafficManual } = coreSiteTrafficSlice.actions;

// --- Selectors ---
export const selectAllTrafficById = (state) => state.coreSiteTraffic.byId;
export const selectTrafficStatus = (state) => state.coreSiteTraffic.status;
export const selectTrafficLastUpdated = (state) => state.coreSiteTraffic.lastUpdated;

export const selectTrafficById = (state, id) => {
  if (!id) return null;
  return state.coreSiteTraffic.byId[id] || state.coreSiteTraffic.byId[String(id)] || null;
};

export default coreSiteTrafficSlice.reducer;
