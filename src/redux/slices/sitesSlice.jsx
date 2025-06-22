// src/redux/slices/sitesSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { generateAllDummyData } from "../dummyData";

// Generate the initial set of data
const { sites } = generateAllDummyData();

const sitesSlice = createSlice({
  name: "sites",
  initialState: {
    items: sites,
    status: "idle", // For potential async loading in the future
    error: null,
  },
  reducers: {
    /**
     * Adds a new site to the list.
     * In a real app, this would be followed by an API call.
     * @param {object} state - The current state.
     * @param {object} action - The action containing the new site payload.
     * action.payload should be a complete site object.
     */
    addSite: (state, action) => {
      // It's good practice to check if a site with the same ID already exists
      const existingSite = state.items.find(
        (site) => site.id === action.payload.id
      );
      if (!existingSite) {
        state.items.push(action.payload);
      }
    },

    /**
     * Deletes a site from the list by its ID.
     * @param {object} state - The current state.
     * @param {object} action - The action containing the site ID payload.
     * action.payload should be the id of the site to remove.
     */
    deleteSite: (state, action) => {
      const siteIdToRemove = action.payload;
      state.items = state.items.filter((site) => site.id !== siteIdToRemove);
    },

    /**
     * Updates an existing site. The payload must contain the site's ID
     * and the properties to update.
     * @param {object} state - The current state.
     * @param {object} action - The action containing the update payload.
     * action.payload should be an object like { id: 123, site_name_hebrew: 'New Name' }
     */
    updateSite: (state, action) => {
      const { id, ...updatedFields } = action.payload;
      const siteIndex = state.items.findIndex((site) => site.id === id);
      if (siteIndex !== -1) {
        // Merge the existing site data with the updated fields
        state.items[siteIndex] = {
          ...state.items[siteIndex],
          ...updatedFields,
        };
      }
    },
  },
});

// --- Export Actions ---
// These are the "action creators" that you will import into your components
// and dispatch to trigger a state change.
export const { addSite, deleteSite, updateSite } = sitesSlice.actions;

// --- Export Selectors (Optional but good practice) ---
// Selectors can be used in components to grab specific pieces of data from the store.
export const selectAllSites = (state) => state.sites.items;
export const selectSiteById = (state, siteId) =>
  state.sites.items.find((site) => site.id === siteId);
export const selectSitesByDeviceId = (state, deviceId) =>
  state.sites.items.filter((site) => site.device_id === deviceId);

// --- Export Reducer ---
// This is the default export that will be included in the main Redux store configuration.
export default sitesSlice.reducer;
