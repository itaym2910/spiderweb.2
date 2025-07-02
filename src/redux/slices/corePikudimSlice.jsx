import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
// 1. Import the real API service
import { api } from "../../services/apiService"; // Adjust path if necessary
// 2. Import the logout action from the auth slice to listen for it
import { logout } from "./authSlice";

// --- INITIAL STATE ---
// This defines the starting shape of this slice of the Redux store.
const initialState = {
  items: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// --- ASYNC THUNKS (for interacting with the API) ---

/**
 * FETCH: Fetches all core pikudim from the server.
 */
export const fetchCorePikudim = createAsyncThunk(
  "corePikudim/fetchCorePikudim",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getCorePikudim();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * ADD: Adds a new core pikud via the API and returns the new item.
 */
export const addCorePikudim = createAsyncThunk(
  "corePikudim/add",
  async (newPikudData, { rejectWithValue }) => {
    try {
      // The API call returns the newly created object, including its server-generated ID
      const newPikud = await api.addCorePikudim(newPikudData);
      return newPikud;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * DELETE: Deletes a core pikud via the API and returns the deleted item's ID.
 */
export const deleteCorePikudim = createAsyncThunk(
  "corePikudim/delete",
  async (pikudId, { rejectWithValue }) => {
    try {
      await api.deleteCorePikudim(pikudId);
      // Return the ID on success so the reducer knows which item to remove
      return pikudId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- THE SLICE DEFINITION ---
const corePikudimSlice = createSlice({
  name: "corePikudim",
  initialState,
  // `reducers` is for synchronous actions only. API calls must use `extraReducers`.
  // This object is now empty because all our actions are async.
  reducers: {},
  // `extraReducers` handle the lifecycle of our async thunks.
  extraReducers: (builder) => {
    builder
      // --- Cases for fetching all pikudim ---
      .addCase(fetchCorePikudim.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCorePikudim.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCorePikudim.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Case for successfully adding a pikud ---
      .addCase(addCorePikudim.fulfilled, (state, action) => {
        // Add the new pikud (returned from the API) to our state array
        state.items.push(action.payload);
      })

      // --- Case for successfully deleting a pikud ---
      .addCase(deleteCorePikudim.fulfilled, (state, action) => {
        const deletedPikudId = action.payload;
        // Filter out the deleted item from our state array
        state.items = state.items.filter((item) => item.id !== deletedPikudId);
      })

      // --- Case for handling user logout ---
      .addCase(logout, (state) => {
        // When the user logs out, reset this slice to its initial state
        // This prevents showing stale data to the next user who logs in.
        state.items = [];
        state.status = "idle";
        state.error = null;
      });
  },
});

// --- EXPORT ACTIONS (None needed from `reducers`) ---

// --- EXPORT SELECTORS ---
export const selectAllPikudim = (state) => state.corePikudim.items;

export const selectPikudimById = (state, pikudimId) =>
  state.corePikudim.items.find((p) => p.id === pikudimId);

// Memoized selector for performance
const selectPikudimItems = (state) => state.corePikudim.items;
const selectTypeId = (state, typeId) => typeId;

export const selectPikudimByTypeId = createSelector(
  [selectPikudimItems, selectTypeId],
  (pikudim, typeId) => {
    if (!typeId) return [];
    return pikudim.filter((p) => p.type_id === typeId);
  }
);

// --- EXPORT REDUCER ---
export default corePikudimSlice.reducer;
