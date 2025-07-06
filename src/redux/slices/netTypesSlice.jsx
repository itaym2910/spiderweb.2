import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
// import { api } from "../../services/api"; // LATER: Uncomment for real API
import { initialData } from "../initialData";
//import { api } from "../../services/api"; // <-- 1. Import the real api
import { logout } from "./authSlice";

// --- MOCK API: Simulates the backend API calls for NetTypes ---
const mockApi = {
  // Simulates fetching all network types.
  getNetTypes: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50)); // Fast fetch
    return initialData.netTypes;
  },
  // Simulates adding a new network type.
  addNetType: async (netTypeData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Mock API: Adding NetType...", netTypeData);
    // In a real API, the backend would assign and return the new ID.
    const newNetType = { ...netTypeData, id: Date.now() };
    return newNetType;
  },
  // Simulates deleting a network type.
  deleteNetType: async (netTypeId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Mock API: Deleting NetType with ID:", netTypeId);
    return { success: true };
  },
};

// --- ENTITY ADAPTER for efficient state management ---
const netTypesAdapter = createEntityAdapter({
  // We expect each netType to have a unique `id`
  selectId: (netType) => netType.id,
});

const initialState = netTypesAdapter.getInitialState({
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
});

// --- ASYNC THUNKS ---

// 1. THUNK for FETCHING all network types
export const fetchNetTypes = createAsyncThunk(
  "netTypes/fetchNetTypes",
  async (_, { rejectWithValue }) => {
    try {
      // LATER: Replace with real API call: const response = await api.getNetTypes();
      const response = await mockApi.getNetTypes();
      //const response = await api.getNetTypes(); // <-- 2. Import the real api
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. THUNK for ADDING a new network type
export const addNetType = createAsyncThunk(
  "netTypes/addNetType",
  async (netTypeData, { rejectWithValue }) => {
    // `netTypeData` would be an object like { name: 'Guest Network' }
    try {
      // The API should return the newly created object, including its new ID.
      // LATER: Replace with: const newNetType = await api.addNetType(netTypeData);
      const newNetType = await mockApi.addNetType(netTypeData);
      //const newNetType = await api.addNetType(netTypeData); // <-- 3. Import the real api
      return newNetType;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. THUNK for DELETING a network type
export const deleteNetType = createAsyncThunk(
  "netTypes/deleteNetType",
  async (netTypeId, { rejectWithValue }) => {
    try {
      // LATER: Replace with: await api.deleteNetType(netTypeId);
      await mockApi.deleteNetType(netTypeId);
      // On success, return the ID of the deleted item so the reducer can remove it.
      //await api.deleteNetType(netTypeId);  // <-- 4. Import the real api
      return netTypeId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- THE SLICE DEFINITION ---
const netTypesSlice = createSlice({
  name: "netTypes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Reducers for Fetching ---
      .addCase(fetchNetTypes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNetTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Use the adapter to efficiently set all items
        netTypesAdapter.setAll(state, action.payload);
      })
      .addCase(fetchNetTypes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Reducers for Adding (Pessimistic Update) ---
      .addCase(addNetType.fulfilled, (state, action) => {
        // Add the new item to the state after the API call succeeds
        netTypesAdapter.addOne(state, action.payload);
      })
      // You can add .pending and .rejected cases for addNetType if you need to show specific UI feedback

      // --- Reducers for Deleting (Pessimistic Update) ---
      .addCase(deleteNetType.fulfilled, (state, action) => {
        // Remove the item from the state after the API call succeeds
        netTypesAdapter.removeOne(state, action.payload); // payload is the netTypeId
      })
      // You can add .pending and .rejected cases for deleteNetType for UI feedback

      // --- Reducer for Logout ---
      .addCase(logout, () => {
        // Reset the slice to its initial empty state on logout
        return initialState;
      });
  },
});

// --- EXPORT ACTIONS ---
// The async thunks `fetchNetTypes`, `addNetType`, and `deleteNetType` are the primary actions to be dispatched from the UI.

// --- EXPORT SELECTORS ---
// The adapter provides memoized selectors for free!
export const {
  selectAll: selectAllNetTypes,
  selectById: selectNetTypeById,
  selectIds: selectNetTypeIds,
} = netTypesAdapter.getSelectors((state) => state.netTypes);

// Also export status and error selectors for the UI to use
export const selectNetTypesStatus = (state) => state.netTypes.status;
export const selectNetTypesError = (state) => state.netTypes.error;

// --- EXPORT REDUCER ---
export default netTypesSlice.reducer;
