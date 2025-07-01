// src/redux/slices/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

import { initialData } from "../initialData";
const { dummyUsers } = initialData;

// --- The Async Thunk for Logging In ---
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    // --- MOCK BACKEND LOGIC ---
    // We replace the fetch call with this mock logic.
    try {
      // 1. Simulate network delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 2. Find a user that matches the provided credentials
      const user = dummyUsers.find(
        (u) => u.username === username && u.password === password
      );

      // 3. Check if a user was found
      if (user) {
        // SUCCESS: User found.
        // Create a mock JWT token. btoa() creates a Base64-encoded string.
        const mockTokenPayload = {
          username: user.username,
          role: user.role,
          iat: Date.now(), // "issued at" timestamp
        };
        const mockToken = `fake-header.${btoa(
          JSON.stringify(mockTokenPayload)
        )}.fake-signature`;

        // Set the cookie
        Cookies.set("authToken", mockToken, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });

        // Return the token on success
        return mockToken;
      } else {
        // FAILURE: No user found.
        // Reject with a specific error message.
        return rejectWithValue("Invalid credentials. Please try again.");
      }
    } catch (error) {
      // Handle any unexpected errors during the process
      return rejectWithValue(error.message);
    }
    // --- END MOCK BACKEND LOGIC ---
  }
);

// --- The Auth Slice ---
// The rest of the slice remains exactly the same.
const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: Cookies.get("authToken") || null,
    status: "idle",
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.status = "idle";
      state.error = null;
      Cookies.remove("authToken");
    },
  },
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

export const { logout } = authSlice.actions;

export const selectAuthToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
