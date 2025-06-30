// src/redux/slices/sitesSlice.js

import { createSlice, createSelector } from "@reduxjs/toolkit";
import { initialData } from "../initialData";

const { sites } = initialData;

const sitesSlice = createSlice({
  name: "sites",
  initialState: {
    items: sites,
    status: "idle",
    error: null,
  },
  reducers: {
    // ... your reducers are unchanged ...
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
});

export const { addSite, deleteSite, updateSite } = sitesSlice.actions;

// --- Selectors ---

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

export default sitesSlice.reducer;
