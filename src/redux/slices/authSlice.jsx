// src/redux/slices/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// --- 1. Import the individual data-fetching thunks from other slices ---
import { fetchCorePikudim } from "./corePikudimSlice";
import { fetchDevices } from "./devicesSlice";
import { fetchSites } from "./sitesSlice";
import { fetchTenGigLinks } from "./tenGigLinksSlice";
import { fetchNetTypes } from "./netTypesSlice";

import { api } from "../../services/apiServices";

// --- 2. The "Master" Data Fetching Thunk ---
export const fetchInitialData = createAsyncThunk(
  "auth/fetchInitialData",
  async (_, { dispatch }) => {
    dispatch(fetchCorePikudim());
    dispatch(fetchDevices());
    dispatch(fetchSites());
    dispatch(fetchTenGigLinks());
    dispatch(fetchNetTypes());
  }
);

// --- 3. The Login User Thunk ---
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    try {
      const token = await api.login(username, password);

      // Set the token in a cookie for session persistence
      Cookies.set("authToken", token, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });

      // **KEY STEP:** After a successful login, trigger the fetch for all initial app data.
      dispatch(fetchInitialData());

      // Return the token to be saved in the auth state
      return token;
    } catch (error) {
      // If login fails, pass the error message to the 'rejected' case
      return rejectWithValue(error.message);
    }
  }
);

// --- 4. The Auth Slice Definition ---
const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: Cookies.get("authToken") || null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Handles user-initiated logout
    logout: (state) => {
      state.token = null;
      state.status = "idle";
      state.error = null;
      Cookies.remove("authToken");
      // Note: You might want to also dispatch actions to clear the other data slices here
      // if you want the data to be gone immediately on logout.
    },
  },
  // Handles the lifecycle of the `loginUser` thunk
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// --- Export Actions and Selectors ---
export const { logout } = authSlice.actions;

export const selectAuthToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

// --- Export Reducer ---
export default authSlice.reducer;
