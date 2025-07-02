// src/redux/slices/favoritesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/apiService"; // Adjust path if needed
import { logout } from "./authSlice";

// --- ASYNC THUNKS ---

// 1. Fetches the initial list of favorites when the app loads
export const fetchFavoriteLinks = createAsyncThunk(
  "favorites/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getFavoriteLinks();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load favorites.");
    }
  }
);

// 2. Updates the favorites list on the server
export const updateFavoriteLinksOnServer = createAsyncThunk(
  "favorites/update",
  async (favoriteIds, { rejectWithValue }) => {
    try {
      return await api.updateFavoriteLinks(favoriteIds);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load favorites.");
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    ids: [], // Holds the array of favorite link IDs
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // This reducer provides an INSTANT UI update.
    // The component will then dispatch the async thunk to save the change.
    toggleFavorite: (state, action) => {
      const id = action.payload;
      const index = state.ids.indexOf(id);

      if (index >= 0) {
        state.ids.splice(index, 1); // Remove if exists
      } else {
        state.ids.push(id); // Add if doesn't exist
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetching initial favorites
      .addCase(fetchFavoriteLinks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFavoriteLinks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ids = action.payload; // Populate state from server
      })
      .addCase(fetchFavoriteLinks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Handle saving favorites to the server (provides feedback)
      .addCase(updateFavoriteLinksOnServer.pending, (state) => {
        // You could use this to show a tiny "saving..." indicator
        state.status = "loading";
      })
      .addCase(updateFavoriteLinksOnServer.fulfilled, (state) => {
        // The state is already correct, just mark as succeeded
        state.status = "succeeded";
      })
      .addCase(updateFavoriteLinksOnServer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        // Optionally, you could revert the toggle action here for a robust UI
      })
      // Clear favorites on logout
      .addCase(logout, (state) => {
        state.ids = [];
        state.status = "idle";
        state.error = null;
      });
  },
});

export const { toggleFavorite } = favoritesSlice.actions;

export const selectFavoriteLinkIds = (state) => state.favorites.ids;
export const selectFavoritesStatus = (state) => state.favorites.status;

export default favoritesSlice.reducer;
