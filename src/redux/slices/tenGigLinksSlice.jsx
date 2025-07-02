import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { api } from "../../services/apiService";
import { logout } from "./authSlice";

// --- ASYNC THUNKS ---

export const fetchTenGigLinks = createAsyncThunk(
  "tenGigLinks/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getTenGigLines();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// CHANGED: Added `export` here to declare and export at the same time.
export const addTenGigLink = createAsyncThunk(
  "tenGigLinks/addOne",
  async (linkData, { rejectWithValue }) => {
    try {
      const newLink = await api.addTenGigLink(linkData);
      return newLink;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// CHANGED: Added `export` here.
export const deleteTenGigLink = createAsyncThunk(
  "tenGigLinks/deleteOne",
  async (linkId, { rejectWithValue }) => {
    try {
      await api.deleteTenGigLink(linkId);
      return linkId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// CHANGED: Added `export` here.
export const updateTenGigLink = createAsyncThunk(
  "tenGigLinks/updateOne",
  async (linkUpdateData, { rejectWithValue }) => {
    try {
      const updatedLink = await api.updateTenGigLink(linkUpdateData);
      return updatedLink;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// --- The Slice Definition ---
const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const tenGigLinksSlice = createSlice({
  name: "tenGigLinks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Cases for fetching all links
      .addCase(fetchTenGigLinks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTenGigLinks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTenGigLinks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Case for successfully adding a new link
      .addCase(addTenGigLink.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Case for successfully deleting a link
      .addCase(deleteTenGigLink.fulfilled, (state, action) => {
        const deletedLinkId = action.payload;
        state.items = state.items.filter((link) => link.id !== deletedLinkId);
      })
      // Case for successfully updating a link
      .addCase(updateTenGigLink.fulfilled, (state, action) => {
        const updatedLink = action.payload;
        const index = state.items.findIndex(
          (link) => link.id === updatedLink.id
        );
        if (index !== -1) {
          state.items[index] = updatedLink;
        }
      })
      // Case for handling LOGOUT
      .addCase(logout, () => {
        return initialState;
      });
  },
});

// --- REMOVED: The redundant export block that caused the error is gone. ---

// --- Export Selectors (These remain the same) ---
export const selectAllTenGigLinks = (state) => state.tenGigLinks.items;

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
