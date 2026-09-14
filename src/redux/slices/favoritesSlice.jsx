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
      
      const ids = rawList.map((item) => {
        if (typeof item === "object" && item !== null) {
          const id = item.id || item.link_id || item.Link_ID || item.linkId;
          if (id) return String(id);
        }
        return String(item);
      });
      
      const items = rawList.filter(item => typeof item === "object" && item !== null);
      return { ids, items };
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
    // Check if the link exists BEFORE the pending action updates the state
    // Actually, RTK dispatches pending before executing this, so we check the NEW state.
    const { ids } = getState().favorites;
    const isAdding = ids.includes(String(linkId));

    try {
      if (isAdding) {
        await api.addFavoriteLink(linkId);
      } else {
        await api.removeFavoriteLink(linkId);
      }
      return { linkId: String(linkId), isAdding };
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
    ids: [],
    items: [],
    status: "idle",
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
        state.ids = action.payload.ids;
        state.items = action.payload.items;
      })
      .addCase(fetchFavoriteLinks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

// --- Reducers for the optimistic toggle ---
      .addCase(toggleFavoriteLink.pending, (state, action) => {
        const linkId = String(action.meta.arg);
        const currentStringIds = state.ids.map(String);
        const index = currentStringIds.indexOf(linkId);
        if (index >= 0) {
          state.ids.splice(index, 1);
          if (state.items) {
             state.items = state.items.filter(item => String(item.id) !== linkId);
          }
        } else {
          state.ids.push(linkId);
          // We can't add to items here easily because we only have the ID,
          // but the item is already in allTenGigLinks anyway so it will render.
        }
      })
      .addCase(toggleFavoriteLink.fulfilled, (state, action) => {
        // The API call was successful. The state is already correct from the optimistic update.
        // We don't need to replace state.ids because we don't return the full array anymore.
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
