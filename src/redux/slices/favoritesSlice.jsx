// src/redux/slices/favoritesSlice.js

import { createSlice } from "@reduxjs/toolkit";

// --- THE FIX: Use a plain array for initialState ---
const initialState = {
  ids: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    // --- THE FIX: Rewrite the reducer logic to work with an array ---
    toggleFavorite: (state, action) => {
      const id = action.payload;
      const index = state.ids.indexOf(id);

      if (index >= 0) {
        // If the ID already exists in the array, remove it.
        // Immer allows us to "mutate" the state here; it will create a new array.
        state.ids.splice(index, 1);
      } else {
        // If the ID does not exist, add it to the end of the array.
        state.ids.push(id);
      }
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;

// The selector now returns an array of IDs, e.g., ["id-1", "id-2"]
export const selectFavoriteIds = (state) => state.favorites.ids;

export default favoritesSlice.reducer;
