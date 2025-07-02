import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// 1. Import your centralized API service
import { api } from "../../services/apiService"; // Adjust path if needed
// 2. Import the logout action to listen for it
import { logout } from "./authSlice"; // Adjust path if needed

// --- ASYNC THUNKS ---

/**
 * Fetches all network types from the server.
 * NOTE: Your API list did not include a "get_all_net_types" endpoint.
 * You will need to add one on your backend for this thunk to work.
 */
export const fetchNetTypes = createAsyncThunk(
  "netTypes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      // Assuming an endpoint like `api.getNetTypes()` exists or will be created.
      const response = await api.getNetTypes();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Adds a new network type via the API.
 */
export const addNetType = createAsyncThunk(
  "netTypes/add",
  async (netTypeData, { rejectWithValue }) => {
    try {
      // The API call returns the newly created net type object (with its server-generated ID)
      const newNetType = await api.addNetType(netTypeData);
      return newNetType;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Deletes a network type by its ID via the API.
 */
export const deleteNetType = createAsyncThunk(
  "netTypes/delete",
  async (netTypeId, { rejectWithValue }) => {
    try {
      await api.deleteNetType(netTypeId);
      // On success, return the ID of the deleted item
      return netTypeId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Define the initial state for this slice
const initialState = {
  items: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const netTypesSlice = createSlice({
  name: "netTypes",
  initialState,
  // The 'reducers' object is now empty because all mutations
  // are handled by the async thunks in 'extraReducers'.
  reducers: {},
  // This handles the state changes based on the lifecycle of the async thunks.
  extraReducers: (builder) => {
    builder
      // Cases for fetching all network types
      .addCase(fetchNetTypes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNetTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchNetTypes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Case for successfully adding a new network type
      .addCase(addNetType.fulfilled, (state, action) => {
        // Add the new item returned from the server to our state array
        state.items.push(action.payload);
      })
      // You can also add .pending and .rejected cases for addNetType
      // to show loading spinners or error messages for that specific action.

      // Case for successfully deleting a network type
      .addCase(deleteNetType.fulfilled, (state, action) => {
        // Filter out the deleted item using the ID returned by the thunk
        const deletedId = action.payload;
        state.items = state.items.filter((type) => type.id !== deletedId);
      })

      // --- CRITICAL: Handle Logout ---
      // This listens for the `logout` action from `authSlice` and resets the state.
      .addCase(logout, (state) => {
        // Reset the state to its initial, empty values
        state.items = [];
        state.status = "idle";
        state.error = null;
      });
  },
});

// --- Export Selectors ---
export const selectAllNetTypes = (state) => state.netTypes.items;
export const selectNetTypeById = (state, typeId) =>
  state.netTypes.items.find((type) => type.id === typeId);

// --- Export Reducer ---
export default netTypesSlice.reducer;
