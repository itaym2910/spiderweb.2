// src/redux/slices/tenGigLinksSlice.js

import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { initialData } from "../initialData";

import { api } from "../../services/apiServices";

// --- ASYNC THUNK: For fetching the 10-Gigabit links ---
export const fetchTenGigLinks = createAsyncThunk(
  "tenGigLinks/fetchTenGigLinks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getTenGigLines();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch 10-Gigabit links"
      );
    }
  }
);

// --- The Slice Definition ---
// Shape of a Link object in the state:
// {
//   id: "link-10g-xyz",
//   source: "rtr-abcd-1",
//   target: "rtr-efgh-2",
//   status: "up" | "down" | "issue",
//   network_type_id: 1,
//   ip: "...",
//
//   // --- NEW ENRICHED FIELDS ---
//   physicalStatus: "Up" | "Down" | "N/A",
//   protocolStatus: "Up" | "Down" | "N/A",
//   MPLS: "Enabled" | "N/A",
//   OSPF: "Enabled" | "N/A",
//   Bandwidth: 10000 | "N/A",
//   Description: "Some description text..." | "N/A",
//   MediaType: "Fiber" | "N/A",
//   CDP: "neighbor-switch-xyz" | "N/A",
//   TX: -3.4 | "N/A",
//   RX: -4.1 | "N/A"
// }
const tenGigLinksSlice = createSlice({
  name: "tenGigLinks",
  initialState: {
    items: [], // Start with an empty array for the links
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  // Reducers for synchronous actions
  reducers: {
    addTenGigLink: (state, action) => {
      state.items.push(action.payload);
    },
    deleteTenGigLink: (state, action) => {
      const linkIdToRemove = action.payload;
      state.items = state.items.filter((link) => link.id !== linkIdToRemove);
    },
    updateTenGigLink: (state, action) => {
      const { id, ...updatedFields } = action.payload;
      const linkIndex = state.items.findIndex((link) => link.id === id);
      if (linkIndex !== -1) {
        state.items[linkIndex] = {
          ...state.items[linkIndex],
          ...updatedFields,
        };
      }
    },
  },
  // extraReducers handle the lifecycle of the `fetchTenGigLinks` async thunk
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenGigLinks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTenGigLinks.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Populate the state with the fetched link data
        state.items = action.payload;
      })
      .addCase(fetchTenGigLinks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// --- Export Actions ---
export const { addTenGigLink, deleteTenGigLink, updateTenGigLink } =
  tenGigLinksSlice.actions;

// --- Export Selectors ---
export const selectAllTenGigLinks = (state) => state.tenGigLinks.items;

// --- MEMOIZED SELECTOR ---
const selectLinkItems = (state) => state.tenGigLinks.items;
const selectTypeIdFromLink = (state, typeId) => typeId;

export const selectLinksByTypeId = createSelector(
  [selectLinkItems, selectTypeIdFromLink],
  (links, typeId) => {
    if (!typeId) return [];
    return links.filter((l) => {
      if (l.network_type_id !== undefined) return l.network_type_id === typeId;
      if (l.type_id !== undefined) return l.type_id === typeId;
      return true;
    });
  }
);

// --- Export Reducer ---
export default tenGigLinksSlice.reducer;
