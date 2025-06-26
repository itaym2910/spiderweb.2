// src/redux/slices/favoritesSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ids: new Set(),
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const id = action.payload;

      // --- THIS IS THE FIX ---

      // 1. Create a new Set from the current state to ensure immutability.
      //    This is the key step. We are making a copy.
      const newIds = new Set(state.ids);

      // 2. Modify the COPY, not the original state object from the arguments.
      if (newIds.has(id)) {
        newIds.delete(id);
      } else {
        newIds.add(id);
      }

      // 3. Assign the new, modified Set back to the state draft.
      //    This changes the reference, which Redux and useSelector will detect.
      state.ids = newIds;
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;

export const selectFavoriteIds = (state) => state.favorites.ids;

export default favoritesSlice.reducer;
