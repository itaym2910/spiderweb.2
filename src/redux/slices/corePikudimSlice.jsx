import { createSlice } from "@reduxjs/toolkit";
// Import from the new central file
import { initialData } from "../initialData";

// Use the pre-generated data
const { corePikudim } = initialData;

const corePikudimSlice = createSlice({
  name: "corePikudim",
  initialState: {
    items: corePikudim,
    status: "idle",
  },
  // ... rest of the slice is unchanged
  reducers: {
    addCorePikudim: (state, action) => {
      state.items.push(action.payload);
    },
    deleteCorePikudim: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addCorePikudim, deleteCorePikudim } = corePikudimSlice.actions;
export const selectAllPikudim = (state) => state.corePikudim.items;
export const selectPikudimById = (state, pikudimId) =>
  state.corePikudim.items.find((p) => p.id === pikudimId);
export default corePikudimSlice.reducer;
