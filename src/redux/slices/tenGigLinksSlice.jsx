import { createSlice } from "@reduxjs/toolkit";
// Import from the new central file
import { initialData } from "../initialData";

// Use the pre-generated data
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
export const selectAllTenGigLinks = (state) => state.tenGigLinks.items;
export default tenGigLinksSlice.reducer;
