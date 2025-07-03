import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
// Assuming an apiService file exists to handle the actual HTTP requests
// import { apiService } from "../../services/apiService";
import { initialData } from "../initialData";

// --- MOCK API ---
const mockApi = {
  getCorePikudim: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return initialData.corePikudim;
  },
  // Mocks for the new operations
  addCoreSite: async (siteData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Mock API: Adding site...", siteData);
    // In a real API, you'd get the newly created object back
    return { ...siteData, id: Date.now(), timestamp: new Date().toISOString() };
  },
  deleteCoreSite: async (siteId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Mock API: Deleting site with ID:", siteId);
    return { success: true };
  },
};

// --- ASYNC THUNKS ---

// 1. For FETCHING the initial list of Pikudim (Core Sites)
export const fetchCorePikudim = createAsyncThunk(
  "corePikudim/fetchCorePikudim",
  async (_, { rejectWithValue }) => {
    try {
      // const response = await apiService.getCorePikudim();
      const response = await mockApi.getCorePikudim();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. For ADDING a new Core Site
export const addCoreSite = createAsyncThunk(
  "corePikudim/addCoreSite",
  async (siteData, { dispatch, rejectWithValue }) => {
    try {
      // This is where you call your real backend API
      // await apiService.addCorePikudim(siteData);
      await mockApi.addCoreSite(siteData);

      // On success, re-fetch the entire list to ensure data consistency
      dispatch(fetchCorePikudim());

      return siteData; // Return the original data for potential UI feedback
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. For DELETING a Core Site
export const deleteCoreSite = createAsyncThunk(
  "corePikudim/deleteCoreSite",
  async (siteId, { dispatch, rejectWithValue }) => {
    try {
      // This is where you call your real backend API
      // await apiService.deleteCorePikudim(siteId);
      await mockApi.deleteCoreSite(siteId);

      // On success, re-fetch the list to reflect the deletion
      dispatch(fetchCorePikudim());

      return siteId; // Return the deleted ID for potential UI feedback
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- The Slice Definition ---
const corePikudimSlice = createSlice({
  name: "corePikudim",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  // Synchronous reducers are no longer needed for add/delete
  reducers: {},
  // This handles the state changes for the FETCH thunk.
  // We don't need to handle add/delete here because the re-fetch takes care of it.
  extraReducers: (builder) => {
    builder
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
      });
  },
});

// --- Export Selectors (Unchanged) ---
export const selectAllPikudim = (state) => state.corePikudim.items;

export const selectPikudimById = (state, pikudimId) =>
  state.corePikudim.items.find((p) => p.id === pikudimId);

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
