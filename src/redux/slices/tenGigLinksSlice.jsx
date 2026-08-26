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
  async ({ skip = 0, limit = 20, coredevice_id = null, start_date = null, end_date = null } = {}, { rejectWithValue }) => {
    try {
      const response = await api.getTenGigLines(skip, limit, coredevice_id, start_date, end_date);
      return { data: response, skip, limit, coredevice_id, start_date, end_date };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch 10-Gigabit links"
      );
    }
  }
);

// --- The Slice Definition ---
const tenGigLinksSlice = createSlice({
  name: "tenGigLinks",
  initialState: {
    items: [], // Start with an empty array for the links
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' — only for initial load
    paginationStatus: "idle", // separate status for "load more" fetches
    error: null,
    hasMore: true,
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
        const existingLink = state.items[linkIndex];
        const statusChanged =
          updatedFields.status && updatedFields.status !== existingLink.status;
        state.items[linkIndex] = {
          ...existingLink,
          ...updatedFields,
          ...(statusChanged && !updatedFields.statusChangedAt
            ? { statusChangedAt: new Date().toISOString() }
            : {}),
        };
      }
    },
  },
  // extraReducers handle the lifecycle of the `fetchTenGigLinks` async thunk
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenGigLinks.pending, (state, action) => {
        const skip = action.meta.arg?.skip ?? 0;
        if (skip === 0 && state.status === "idle") {
          // Very first app load — set main status so AppInitializer shows spinner
          state.status = "loading";
        } else {
          // Pagination or Filter change — only set paginationStatus
          state.paginationStatus = "loading";
        }
        state.error = null;
      })
      .addCase(fetchTenGigLinks.fulfilled, (state, action) => {
        const { data, skip, limit } = action.payload;
        if (skip === 0) {
          state.status = "succeeded";
          state.paginationStatus = "succeeded";
          state.items = data;
        } else {
          state.paginationStatus = "succeeded";
          state.items = [...state.items, ...data];
        }
        state.hasMore = data.length > 0;
      })
      .addCase(fetchTenGigLinks.rejected, (state, action) => {
        const skip = action.meta.arg?.skip ?? 0;
        if (skip === 0 && state.status === "idle") {
          state.status = "failed";
        } else {
          state.paginationStatus = "failed";
        }
        state.error = action.payload;
      });
  },
});

// --- Export Actions ---
export const { addTenGigLink, deleteTenGigLink, updateTenGigLink } =
  tenGigLinksSlice.actions;

// --- Export Selectors ---
export const selectAllTenGigLinks = (state) => state.tenGigLinks.items;
export const selectTenGigLinksHasMore = (state) => state.tenGigLinks.hasMore;
export const selectTenGigLinksStatus = (state) => state.tenGigLinks.status;
export const selectTenGigLinksPaginationStatus = (state) => state.tenGigLinks.paginationStatus;
export const selectTenGigLinksError = (state) => state.tenGigLinks.error;

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
