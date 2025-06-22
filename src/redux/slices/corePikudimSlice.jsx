import { createSlice } from "@reduxjs/toolkit";
import { generateAllDummyData } from "../dummyData";

const { corePikudim } = generateAllDummyData();

const corePikudimSlice = createSlice({
  name: "corePikudim",
  initialState: {
    items: corePikudim,
    status: "idle", // for async loading state later
  },
  reducers: {
    // Reducer for adding a new pikud
    addCorePikudim: (state, action) => {
      // action.payload will be the new pikud object
      state.items.push(action.payload);
    },
    // Reducer for deleting a pikud
    deleteCorePikudim: (state, action) => {
      // action.payload will be the id of the pikud to delete
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

// Export the actions so our components can dispatch them
export const { addCorePikudim, deleteCorePikudim } = corePikudimSlice.actions;

// Export the reducer to be added to the store
export default corePikudimSlice.reducer;
