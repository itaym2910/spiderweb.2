import { createSlice, createSelector } from "@reduxjs/toolkit"; // Import createSelector
import { initialData } from "../initialData";

const { corePikudim } = initialData;

const corePikudimSlice = createSlice({
  name: "corePikudim",
  initialState: {
    items: corePikudim,
    status: "idle",
  },
  // ... rest of the slice is unchanged
  reducers: {
    addCorePikudim: (state, action) => {
      state.items.push(action.payload);
    },
    deleteCorePikudim: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addCorePikudim, deleteCorePikudim } = corePikudimSlice.actions;

// --- Selectors ---

export const selectAllPikudim = (state) => state.corePikudim.items;

export const selectPikudimById = (state, pikudimId) =>
  state.corePikudim.items.find((p) => p.id === pikudimId);

// --- MEMOIZED SELECTOR ---
const selectPikudimItems = (state) => state.corePikudim.items;
const selectTypeId = (state, typeId) => typeId;

export const selectPikudimByTypeId = createSelector(
  [selectPikudimItems, selectTypeId],
  (pikudim, typeId) => {
    if (!typeId) return [];
    return pikudim.filter((p) => p.type_id === typeId);
  }
);

export default corePikudimSlice.reducer;
