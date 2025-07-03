// src/redux/store.js

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import sitesReducer from "./slices/sitesSlice";
import devicesReducer from "./slices/devicesSlice";
import tenGigLinksReducer from "./slices/tenGigLinksSlice";
import corePikudimReducer from "./slices/corePikudimSlice";
import favoritesReducer from "./slices/favoritesSlice";
import netTypesReducer from "./slices/netTypesSlice";
import authReducer, { logout } from "./slices/authSlice";
import realtimeReducer from "./slices/realtimeSlice";
import alertsReducer from "./slices/alertsSlice";
import realtimeMiddleware from "./middleware/realtimeMiddleware";

// 1. Combine all your slice reducers into a single "app" reducer
const appReducer = combineReducers({
  sites: sitesReducer,
  devices: devicesReducer,
  tenGigLinks: tenGigLinksReducer,
  corePikudim: corePikudimReducer,
  favorites: favoritesReducer,
  netTypes: netTypesReducer,
  auth: authReducer,
  realtime: realtimeReducer,
  alerts: alertsReducer,
});

// 2. Create a "root" reducer that delegates to the appReducer, but handles the logout case
const rootReducer = (state, action) => {
  // When the logout action is dispatched, reset the state to its initial value
  if (action.type === logout.type) {
    // By passing `undefined` as the state, `appReducer` will return the initial state for all slices.
    // We keep the `auth` and `realtime` state to avoid a flash of a logged-out screen before redirecting.
    // Or, more simply, reset everything:
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  // 3. Use the new rootReducer
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(realtimeMiddleware),
});
