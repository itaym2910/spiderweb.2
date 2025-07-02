// src/redux/slices/sitesSlice.js

import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { initialData } from "../initialData";

// --- MOCK API: Mimics the real API call using dummy data ---
// This isolates the data source, making it easy to swap for the real API later.
const mockApi = {
  getSites: async () => {
    // Simulate a network delay for a realistic loading experience
    await new Promise((resolve) => setTimeout(resolve, 300));
    return initialData.sites;
  },
};

// --- ASYNC THUNK: For fetching the sites ---
// This function is dispatched to start the data fetching process.
export const fetchSites = createAsyncThunk(
  "sites/fetchSites",
  async (_, { rejectWithValue }) => {
    try {
      // LATER: When you switch to the real API, you will change this one line to:
      // const response = await api.getSites();
      const response = await mockApi.getSites();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- The Slice Definition ---
const sitesSlice = createSlice({
  name: "sites",
  initialState: {
    items: [], // Start with an empty array for the sites
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  // Reducers for synchronous, direct state mutations
  reducers: {
    addSite: (state, action) => {
      const existingSite = state.items.find(
        (site) => site.id === action.payload.id
      );
      if (!existingSite) {
        state.items.push(action.payload);
      }
    },
    deleteSite: (state, action) => {
      const siteIdToRemove = action.payload;
      state.items = state.items.filter((site) => site.id !== siteIdToRemove);
    },
    updateSite: (state, action) => {
      const { id, ...updatedFields } = action.payload;
      const siteIndex = state.items.findIndex((site) => site.id === id);
      if (siteIndex !== -1) {
        state.items[siteIndex] = {
          ...state.items[siteIndex],
          ...updatedFields,
        };
      }
    },
  },
  // extraReducers handle the lifecycle of the `fetchSites` async thunk
  extraReducers: (builder) => {
    builder
      .addCase(fetchSites.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSites.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Populate the state with the fetched site data
        state.items = action.payload;
      })
      .addCase(fetchSites.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Get error message from rejectWithValue
      });
  },
});

// --- Export Actions ---
export const { addSite, deleteSite, updateSite } = sitesSlice.actions;

// --- Export Selectors ---
export const selectAllSites = (state) => state.sites.items;

export const selectSiteById = (state, siteId) =>
  state.sites.items.find((site) => site.id === siteId);

// --- MEMOIZED SELECTOR ---
const selectSites = (state) => state.sites.items;
const selectDeviceId = (state, deviceId) => deviceId;

export const selectSitesByDeviceId = createSelector(
  [selectSites, selectDeviceId],
  (allSites, deviceId) => {
    if (!deviceId) return [];
    return allSites.filter((site) => site.device_id === deviceId);
  }
);

// --- Export Reducer ---
export default sitesSlice.reducer;
