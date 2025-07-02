// src/redux/slices/corePikudimSlice.js

import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { initialData } from "../initialData";

// --- MOCK API: Mimics the real API call using dummy data ---
// This part isolates the data source, making it easy to swap later.
const mockApi = {
  getCorePikudim: async () => {
    // Simulate a network delay to make loading states visible
    await new Promise((resolve) => setTimeout(resolve, 200));
    return initialData.corePikudim;
  },
};

// --- ASYNC THUNK: For fetching the data ---
// This function will be dispatched to initiate the data fetching process.
export const fetchCorePikudim = createAsyncThunk(
  "corePikudim/fetchCorePikudim",
  async (_, { rejectWithValue }) => {
    try {
      // LATER: When you're ready for the real API, you will change this one line to:
      // const response = await api.getCorePikudim();
      const response = await mockApi.getCorePikudim();
      return response;
    } catch (error) {
      // Handle potential errors from the API call
      return rejectWithValue(error.message);
    }
  }
);

// --- The Slice Definition ---
const corePikudimSlice = createSlice({
  name: "corePikudim",
  initialState: {
    items: [], // The slice now starts with an empty array
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  // Standard reducers for synchronous actions (like adding/deleting one item)
  reducers: {
    addCorePikudim: (state, action) => {
      state.items.push(action.payload);
    },
    deleteCorePikudim: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
  // extraReducers handle actions from outside the slice, like our async thunk
  extraReducers: (builder) => {
    builder
      .addCase(fetchCorePikudim.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCorePikudim.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Replace the items array with the data fetched from the API
        state.items = action.payload;
      })
      .addCase(fetchCorePikudim.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Use payload from rejectWithValue
      });
  },
});

// --- Export Actions ---
export const { addCorePikudim, deleteCorePikudim } = corePikudimSlice.actions;

// --- Export Selectors ---
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

// --- Export Reducer ---
export default corePikudimSlice.reducer;
