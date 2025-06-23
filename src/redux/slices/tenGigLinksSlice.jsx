import { createSlice } from "@reduxjs/toolkit";
import { generateAllDummyData } from "../dummyData";

const { tenGigLinks } = generateAllDummyData();

const tenGigLinksSlice = createSlice({
  name: "tenGigLinks",
  initialState: {
    items: tenGigLinks,
    status: "idle",
    error: null,
  },
  reducers: {
    // Optional: Add reducers for future actions if needed
    addTenGigLink: (state, action) => {
      state.items.push(action.payload);
    },
    deleteTenGigLink: (state, action) => {
      state.items = state.items.filter((link) => link.id !== action.payload);
    },
    updateTenGigLink: (state, action) => {
      const index = state.items.findIndex(
        (link) => link.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
  },
});

export const { addTenGigLink, deleteTenGigLink, updateTenGigLink } =
  tenGigLinksSlice.actions;

// Selector to get all links from the state
export const selectAllTenGigLinks = (state) => state.tenGigLinks.items;

export default tenGigLinksSlice.reducer;
