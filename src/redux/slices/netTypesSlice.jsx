// src/redux/slices/netTypesSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { generateAllDummyData } from "../dummyData";

// Generate the initial set of data
const { netTypes } = generateAllDummyData();

const netTypesSlice = createSlice({
  name: "netTypes",
  initialState: {
    items: netTypes,
    status: "idle",
    error: null,
  },
  reducers: {
    /**
     * Adds a new network type.
     * @param {object} state - The current state.
     * @param {object} action - The action containing the new network type payload.
     * action.payload should be an object like { id: 4, name: 'Guest Network' }
     */
    addNetType: (state, action) => {
      const existingType = state.items.find(
        (type) => type.id === action.payload.id
      );
      if (!existingType) {
        state.items.push(action.payload);
      }
    },

    /**
     * Deletes a network type by its ID.
     * @param {object} state - The current state.
     * @param {object} action - The action containing the network type ID payload.
     * action.payload should be the id of the network type to remove.
     */
    deleteNetType: (state, action) => {
      const typeIdToRemove = action.payload;
      state.items = state.items.filter((type) => type.id !== typeIdToRemove);
    },
  },
});

// --- Export Actions ---
export const { addNetType, deleteNetType } = netTypesSlice.actions;

// --- Export Selectors ---
export const selectAllNetTypes = (state) => state.netTypes.items;
export const selectNetTypeById = (state, typeId) =>
  state.netTypes.items.find((type) => type.id === typeId);

// --- Export Reducer ---
export default netTypesSlice.reducer;
