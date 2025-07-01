// src/redux/slices/tenGigLinksSlice.js

import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { initialData } from "../initialData";

// --- MOCK API: Mimics the real API call using dummy data ---
// This isolates the data source, making it easy to swap for the real API later.
const mockApi = {
  getTenGigLinks: async () => {
    // Simulate a network delay for a realistic loading experience
    await new Promise((resolve) => setTimeout(resolve, 350));
    return initialData.tenGigLinks;
  },
};

// --- ASYNC THUNK: For fetching the 10-Gigabit links ---
// This function is dispatched to start the data fetching process.
export const fetchTenGigLinks = createAsyncThunk(
  "tenGigLinks/fetchTenGigLinks",
  async (_, { rejectWithValue }) => {
    try {
      // LATER: When you switch to the real API, you will change this one line to:
      // const response = await api.getTenGigLinks();
      const response = await mockApi.getTenGigLinks();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- The Slice Definition ---
const tenGigLinksSlice = createSlice({
  name: "tenGigLinks",
  initialState: {
    items: [], // Start with an empty array for the links
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  // Reducers for synchronous actions
  reducers: {
    // These reducers are for manually adding/deleting links after the initial fetch,
    // for example, in an admin panel.
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
        state.error = action.payload; // Get error message from rejectWithValue
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
    return links.filter((l) => l.network_type_id === typeId);
  }
);

// --- Export Reducer ---
export default tenGigLinksSlice.reducer;
