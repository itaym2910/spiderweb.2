// src/redux/slices/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// Assuming your dummy data is now in a separate file as per your setup
// Adjust the path if necessary
import { initialData } from "../initialData";
const { dummyUsers } = initialData;

// --- 1. MOCK API: This mimics your real API client for now ---
// All the logic for checking credentials against the dummy data is moved here.
// This keeps the Redux Thunk clean and focused on state management.
const mockApi = {
  /**
   * Mock login function that checks against the dummyUsers array.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<string>} A promise that resolves with a token on success.
   * @throws {Error} An error if credentials are invalid.
   */
  login: async (username, password) => {
    // Simulate network delay for a realistic user experience
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Find a user that matches the provided credentials
    const user = dummyUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // SUCCESS: User found. Create and return a mock token.
      const mockTokenPayload = {
        username: user.username,
        role: user.role,
        iat: Date.now(),
      };
      const mockToken = `fake-header.${btoa(
        JSON.stringify(mockTokenPayload)
      )}.fake-signature`;
      return mockToken;
    } else {
      // FAILURE: No user found. Throw an error, just like a real API call would.
      throw new Error("Invalid credentials. Please try again.");
    }
  },
};

// --- 2. REFACTORED THUNK: Now simpler and ready for the real API ---
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      // The thunk now calls our API layer.
      // LATER: You will switch this line to `await api.login(username, password);`
      const token = await mockApi.login(username, password);

      // If the API call is successful, set the cookie
      Cookies.set("authToken", token, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });

      // Return the token to be stored in the Redux state
      return token;
    } catch (error) {
      // If mockApi.login throws an error, we catch it here and
      // use rejectWithValue to pass a clean error message to our reducer.
      return rejectWithValue(error.message);
    }
  }
);

// --- 3. THE SLICE: No changes needed here! ---
// This part remains the same because it's already decoupled from the login logic.
const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: Cookies.get("authToken") || null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
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

// Selectors also remain the same
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
