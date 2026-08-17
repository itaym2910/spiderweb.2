// src/redux/slices/favoritesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { api } from "../../services/apiServices";

// --- ASYNC THUNKS ---

export const fetchFavoriteLinks = createAsyncThunk(
  "favorites/fetchFavoriteLinks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getFavoriteLinks();
      const rawList = Array.isArray(response)
        ? response
        : response?.link_ids || response?.favorite_links || response?.updated_ids || [];
      return rawList.map((item) =>
        item && typeof item === "object" && "id" in item
          ? String(item.id)
          : String(item)
      );
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch favorite links"
      );
    }
  }
);

export const toggleFavoriteLink = createAsyncThunk(
  "favorites/toggleFavoriteLink",
  async (linkId, { getState, rejectWithValue }) => {
    const stringId = String(linkId);
    const { ids: currentIds } = getState().favorites;
    const currentStringIds = (Array.isArray(currentIds) ? currentIds : []).map(String);
    const isCurrentlyFavorite = currentStringIds.includes(stringId);

    const newIds = isCurrentlyFavorite
      ? currentStringIds.filter((id) => id !== stringId)
      : [...currentStringIds, stringId];

    try {
      await api.updateFavoriteLinks(newIds);
      return newIds;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to update favorite link"
      );
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
        const linkId = String(action.meta.arg);
        const currentStringIds = state.ids.map(String);
        const index = currentStringIds.indexOf(linkId);
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
        const linkId = String(action.meta.arg);
        const currentStringIds = state.ids.map(String);
        const index = currentStringIds.indexOf(linkId);
        if (index >= 0) {
          // It's in the state, meaning we optimistically ADDED it. Rollback by REMOVING.
          state.ids.splice(index, 1);
        } else {
          // It's not in the state, meaning we optimistically REMOVED it. Rollback by ADDING.
          state.ids.push(linkId);
        }
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
