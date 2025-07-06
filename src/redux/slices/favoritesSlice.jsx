// src/redux/slices/favoritesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

//import { api } from "../../services/apiServices"; // <-- 1. Import the real api

// --- MOCK API: Simulates fetching/updating favorites on the server ---
// This will be replaced by the real `api` calls.
const mockApi = {
  getFavoriteLinks: async () => {
    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    // In a real scenario, the server would return the user's saved favorites.
    // For the mock, we'll start with a few predefined favorites.
    return ["link-10g-hYpWqRz2", "link-10g-aB3cVfG9", "link-10g-kLp0oXn4"];
  },
  updateFavoriteLinks: async (linkIds) => {
    // Simulate a network delay for the update operation
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log("[Mock API] Updated favorite links on server:", linkIds);
    // Real API would return a success message or the updated list.
    return { success: true, updatedIds: linkIds };
  },
};

// --- ASYNC THUNKS ---

/**
 * Thunk to fetch the user's initial list of favorite link IDs.
 * This should be dispatched after a successful login.
 */
export const fetchFavoriteLinks = createAsyncThunk(
  "favorites/fetchFavoriteLinks",
  async (_, { rejectWithValue }) => {
    try {
      // LATER: Change this to `const response = await api.getFavoriteLinks();`
      const response = await mockApi.getFavoriteLinks();
      //const response = await api.getFavoriteLinks(); // <-- 2. Import the real api
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Thunk to toggle a single favorite link.
 * It uses an "optimistic update" pattern for a fast and responsive UI.
 * 1. It immediately updates the local state (optimistic).
 * 2. It sends the update to the server.
 * 3. If the server fails, it reverts the local state change.
 */
export const toggleFavoriteLink = createAsyncThunk(
  "favorites/toggleFavoriteLink",
  async (linkId, { getState, rejectWithValue }) => {
    const { ids: currentIds } = getState().favorites;
    const isCurrentlyFavorite = currentIds.includes(linkId);

    // Create the new array of IDs that will be sent to the server.
    const newIds = isCurrentlyFavorite
      ? currentIds.filter((id) => id !== linkId)
      : [...currentIds, linkId];

    try {
      // LATER: Change this to `await api.updateFavoriteLinks(newIds);`
      await mockApi.updateFavoriteLinks(newIds);
      // Return the successfully updated array to the `fulfilled` reducer.
      //await api.updateFavoriteLinks(newIds); // <-- 3. Import the real api
      return newIds;
    } catch (error) {
      // If the API call fails, rejectWithValue will pass the error to the `rejected` reducer.
      return rejectWithValue(error.message);
    }
  }
);

// --- The Slice Definition ---
const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    ids: [], // The array of favorite link IDs
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  // No synchronous reducers are needed anymore.
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Reducers for fetching initial favorites ---
      .addCase(fetchFavoriteLinks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFavoriteLinks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ids = action.payload; // Populate with IDs from the server
      })
      .addCase(fetchFavoriteLinks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Reducers for the optimistic toggle ---
      .addCase(toggleFavoriteLink.pending, (state, action) => {
        // OPTIMISTIC UPDATE: Update the state immediately for a responsive UI.
        const linkId = action.meta.arg; // The linkId passed to the thunk
        const index = state.ids.indexOf(linkId);
        if (index >= 0) {
          state.ids.splice(index, 1); // It exists, so remove it
        } else {
          state.ids.push(linkId); // It doesn't exist, so add it
        }
      })
      .addCase(toggleFavoriteLink.fulfilled, (state, action) => {
        // The API call was successful. The state is already correct from the
        // optimistic update, but we can sync it with the server response for safety.
        state.ids = action.payload;
      })
      .addCase(toggleFavoriteLink.rejected, (state, action) => {
        // ROLLBACK: The API call failed. We must revert the optimistic update.
        const linkId = action.meta.arg; // The linkId that failed
        const index = state.ids.indexOf(linkId);
        if (index >= 0) {
          // It's in the state, meaning we optimistically ADDED it. Rollback by REMOVING.
          state.ids.splice(index, 1);
        } else {
          // It's not in the state, meaning we optimistically REMOVED it. Rollback by ADDING.
          state.ids.push(linkId);
        }
        // You might want to show a toast notification to the user here.
        console.error("Failed to update favorite:", action.payload);
      });
  },
});

// --- Export Actions ---
// Note: We don't export actions from `reducers` anymore, only the thunks.

// --- Export Selectors ---
export const selectFavoriteIds = (state) => state.favorites.ids;
export const selectFavoritesStatus = (state) => state.favorites.status;

export default favoritesSlice.reducer;
