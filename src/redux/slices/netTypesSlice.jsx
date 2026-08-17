import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { api } from "../../services/apiServices";
import { logout } from "./authSlice";

// --- ENTITY ADAPTER for efficient state management ---
const netTypesAdapter = createEntityAdapter({
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
      const response = await api.getNetTypes();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch network types"
      );
    }
  }
);

// 2. THUNK for ADDING a new network type
export const addNetType = createAsyncThunk(
  "netTypes/addNetType",
  async (netTypeData, { rejectWithValue }) => {
    try {
      const newNetType = await api.addNetType(netTypeData);
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
      await api.deleteNetType(netTypeId);
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
      .addCase(fetchNetTypes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNetTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        netTypesAdapter.setAll(state, action.payload);
      })
      .addCase(fetchNetTypes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addNetType.fulfilled, (state, action) => {
        netTypesAdapter.addOne(state, action.payload);
      })
      .addCase(deleteNetType.fulfilled, (state, action) => {
        netTypesAdapter.removeOne(state, action.payload);
      })
      .addCase(logout, () => {
        return initialState;
      });
  },
});

export const {
  selectAll: selectAllNetTypes,
  selectById: selectNetTypeById,
  selectIds: selectNetTypeIds,
} = netTypesAdapter.getSelectors((state) => state.netTypes);

export const selectNetTypesStatus = (state) => state.netTypes.status;
export const selectNetTypesError = (state) => state.netTypes.error;

export default netTypesSlice.reducer;
