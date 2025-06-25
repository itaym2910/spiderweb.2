import { createSlice, createSelector } from "@reduxjs/toolkit"; // Import createSelector
import { initialData } from "../initialData";

const { tenGigLinks } = initialData;

const tenGigLinksSlice = createSlice({
  name: "tenGigLinks",
  initialState: {
    items: tenGigLinks,
    status: "idle",
    error: null,
  },
  // ... rest of the slice is unchanged
  reducers: {
    // ...
  },
});

export const { addTenGigLink, deleteTenGigLink, updateTenGigLink } =
  tenGigLinksSlice.actions;

// --- Selectors ---

export const selectAllTenGigLinks = (state) => state.tenGigLinks.items;

// --- MEMOIZED SELECTOR ---
const selectLinkItems = (state) => state.tenGigLinks.items;
const selectTypeIdFromLink = (state, typeId) => typeId;

export const selectLinksByTypeId = createSelector(
  [selectLinkItems, selectTypeIdFromLink],
  (links, typeId) => {
    if (!typeId) return [];
    return links.filter((l) => l.network_type_id === typeId);
  }
);

export default tenGigLinksSlice.reducer;
