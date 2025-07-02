import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

// 1. Import the real API service and the logout action
import { api } from "../../services/apiService"; // Adjust path if necessary
import { logout } from "./authSlice";

// --- ASYNC THUNKS FOR API INTERACTIONS ---

// Fetches the initial list of all sites
export const fetchSites = createAsyncThunk(
  "sites/fetchSites",
  async (_, { rejectWithValue }) => {
    try {
      const sites = await api.getSites(); // Using the real API
      return sites;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Adds a new site by calling the backend API
// NOTE: Your API list did not include an 'addSite' endpoint.
// This thunk assumes you will create `api.addSite()` which calls a POST `/add_site` endpoint.
export const addSite = createAsyncThunk(
  "sites/addSite",
  async (newSiteData, { rejectWithValue }) => {
    try {
      // This call assumes you have an `api.addSite` function
      const newSite = await api.addSite(newSiteData);
      return newSite; // The server should return the newly created site with its ID
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Deletes a site by its ID by calling the backend API
// NOTE: Your API list did not include a 'deleteSite' endpoint.
// This thunk assumes you will create `api.deleteSite()` which calls a DELETE `/delete_site/:siteId` endpoint.
export const deleteSite = createAsyncThunk(
  "sites/deleteSite",
  async (siteId, { rejectWithValue }) => {
    try {
      // This call assumes you have an `api.deleteSite` function
      await api.deleteSite(siteId);
      return siteId; // Return the ID on success for removal from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Updates a site by calling the backend API
// NOTE: Your API list did not include an 'updateSite' endpoint.
// This thunk assumes you will create `api.updateSite()` which calls a PUT `/update_site/:siteId` endpoint.
export const updateSite = createAsyncThunk(
  "sites/updateSite",
  async (siteData, { rejectWithValue }) => {
    try {
      // This call assumes you have an `api.updateSite` function
      const updatedSite = await api.updateSite(siteData);
      return updatedSite; // The server should return the fully updated site object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// --- SLICE DEFINITION ---

const initialState = {
  items: [], // Holds the array of site objects
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const sitesSlice = createSlice({
  name: "sites",
  initialState,
  // 2. The synchronous reducers are removed from here. All state changes that
  // require API calls are now handled by the async thunks in extraReducers.
  reducers: {},

  // 3. Handles all async actions, including fetching, adding, deleting, and logging out.
  extraReducers: (builder) => {
    builder
      // Cases for fetching all sites
      .addCase(fetchSites.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSites.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchSites.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Case for successfully adding a site
      // It pushes the new site returned from the server into the state array.
      .addCase(addSite.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // Case for successfully deleting a site
      // It filters the deleted site out of the state array using its ID.
      .addCase(deleteSite.fulfilled, (state, action) => {
        const deletedSiteId = action.payload;
        state.items = state.items.filter((site) => site.id !== deletedSiteId);
      })

      // Case for successfully updating a site
      // It finds the existing site and replaces it with the updated one from the server.
      .addCase(updateSite.fulfilled, (state, action) => {
        const updatedSite = action.payload;
        const existingSiteIndex = state.items.findIndex(
          (site) => site.id === updatedSite.id
        );
        if (existingSiteIndex !== -1) {
          state.items[existingSiteIndex] = updatedSite;
        }
      })

      // 4. CRITICAL: Case for resetting state on logout
      // When the `logout` action from `authSlice` is dispatched, this reducer
      // runs and resets this slice back to its original empty state.
      .addCase(logout, () => {
        return initialState;
      });
  },
});

// --- EXPORT ACTIONS (Now the async thunks) ---
// Note: We don't export any synchronous actions from the slice itself anymore.
// All interactions are now done through the exported thunks.

// --- EXPORT SELECTORS ---
export const selectAllSites = (state) => state.sites.items;

export const selectSiteById = (state, siteId) =>
  state.sites.items.find((site) => site.id === siteId);

// Memoized selector for filtering sites by a device ID
const selectSites = (state) => state.sites.items;
const selectDeviceId = (state, deviceId) => deviceId;

export const selectSitesByDeviceId = createSelector(
  [selectSites, selectDeviceId],
  (allSites, deviceId) => {
    if (!deviceId) return [];
    return allSites.filter((site) => site.device_id === deviceId);
  }
);

// --- EXPORT REDUCER ---
export default sitesSlice.reducer;
