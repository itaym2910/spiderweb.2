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
    // The data from initialData.sites is now enriched with more fields.
    return initialData.sites;
  },
};

// --- ASYNC THUNK: For fetching the sites ---
export const fetchSites = createAsyncThunk(
  "sites/fetchSites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await mockApi.getSites();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- The Slice Definition ---
// Shape of a Site object in the state:
// {
//   id: 56789,
//   interface_id: "TenGigabitEthernet1/0/1", // Note: This is now the interface name
//   device_id: 456,
//   site_name_english: 'Site SomeCity',
//   timestamp: "...",
//
//   // --- NEW ENRICHED FIELDS ---
//   physicalStatus: "Up" | "Down" | "N/A",
//   protocolStatus: "Up" | "Down" | "N/A",
//   MPLS: "Enabled" | "N/A",
//   OSPF: "Enabled" | "N/A",
//   Bandwidth: 10000 | "N/A",
//   Description: "Some description text..." | "N/A",
//   MediaType: "Fiber" | "N/A",
//   CDP: "neighbor-switch-xyz" | "N/A",
//   TX: -3.4 | "N/A",
//   RX: -4.1 | "N/A"
// }
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
        state.error = action.payload;
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
