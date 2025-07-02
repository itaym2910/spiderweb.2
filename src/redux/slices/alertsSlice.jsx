// src/redux/slices/alertsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/apiService"; // Assuming your api file is here

// --- ASYNC THUNKS for Alerts ---
export const fetchAllAlerts = createAsyncThunk(
  "alerts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getAllAlerts();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAlert = createAsyncThunk(
  "alerts/delete",
  async (alertId, { rejectWithValue }) => {
    try {
      await api.deleteAlert(alertId);
      return alertId; // Return the ID for removal from state
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const favoriteAlert = createAsyncThunk(
  "alerts/favorite",
  async (alertId, { rejectWithValue }) => {
    try {
      await api.favoriteAlert(alertId);
      return alertId; // Return the ID to toggle its favorite status
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const alertsSlice = createSlice({
  name: "alerts",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetching alerts
      .addCase(fetchAllAlerts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllAlerts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAllAlerts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Deleting an alert
      .addCase(deleteAlert.fulfilled, (state, action) => {
        const alertIdToRemove = action.payload;
        state.items = state.items.filter(
          (alert) => alert.id !== alertIdToRemove
        );
      })
      // Favoriting an alert
      .addCase(favoriteAlert.fulfilled, (state, action) => {
        const alertIdToFavorite = action.payload;
        const alert = state.items.find((a) => a.id === alertIdToFavorite);
        if (alert) {
          alert.isFavorite = !alert.isFavorite; // Assuming a boolean property
        }
      });
  },
});

export const selectAllAlerts = (state) => state.alerts.items;
export default alertsSlice.reducer;
