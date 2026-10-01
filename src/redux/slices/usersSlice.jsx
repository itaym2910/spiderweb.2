import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/apiServices";

// --- Fallback users if backend is unreachable ---
const DEFAULT_FALLBACK_USERS = [
  { id: 1, username: "admin", role: "admin" },
  { id: 2, username: "userg", role: "user" },
  { id: 3, username: "noc_operator", role: "user" },
  { id: 4, username: "net_engineer", role: "user" },
  { id: 5, username: "security_lead", role: "admin" },
  { id: 6, username: "dana_cohen", role: "user" },
  { id: 7, username: "itay_m", role: "admin" },
  { id: 8, username: "ron_levy", role: "user" },
  { id: 9, username: "devops_guy", role: "user" },
  { id: 10, username: "sys_analyst", role: "user" },
];

// --- ASYNC THUNKS ---

// 1. Fetch all users from GET /users/
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async () => {
    try {
      const response = await api.getUsers();
      if (Array.isArray(response)) {
        return response;
      }
      return DEFAULT_FALLBACK_USERS;
    } catch (error) {
      console.warn("fetchUsers failed, using fallback:", error.message);
      // If backend call fails (e.g., in offline/dev mock mode), fallback to default list
      return DEFAULT_FALLBACK_USERS;
    }
  }
);

// 2. Make user an admin via PUT /users/{user_id}/make-admin
export const makeUserAdmin = createAsyncThunk(
  "users/makeUserAdmin",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.makeUserAdmin(userId);
      // Re-fetch users to ensure sync with database
      dispatch(fetchUsers());
      return {
        userId,
        message: response?.message || `User #${userId} is now an admin`,
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        "Failed to update user role to admin";
      return rejectWithValue(errorMsg);
    }
  }
);

// --- The Slice Definition ---
const usersSlice = createSlice({
  name: "users",
  initialState: {
    items: DEFAULT_FALLBACK_USERS,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Optimistic / local update helper if needed
    setUserRoleLocally: (state, action) => {
      const { userId, role } = action.payload;
      const user = state.items.find((u) => u.id === userId);
      if (user) {
        user.role = role;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(makeUserAdmin.fulfilled, (state, action) => {
        const { userId } = action.payload;
        const user = state.items.find((u) => u.id === userId);
        if (user) {
          user.role = "admin";
        }
      });
  },
});

export const { setUserRoleLocally } = usersSlice.actions;

// --- Export Selectors ---
export const selectAllUsers = (state) => state.users?.items || [];
export const selectUsersStatus = (state) => state.users?.status || "idle";
export const selectUsersError = (state) => state.users?.error || null;

export default usersSlice.reducer;
