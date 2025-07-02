// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import sitesReducer from "./slices/sitesSlice";
import devicesReducer from "./slices/devicesSlice";
import tenGigLinksReducer from "./slices/tenGigLinksSlice";
import corePikudimReducer from "./slices/corePikudimSlice";
import favoritesReducer from "./slices/favoritesSlice";
import netTypesReducer from "./slices/netTypesSlice";
import authReducer from "./slices/authSlice";
import realtimeReducer from "./slices/realtimeSlice";
import alertsReducer from "./slices/alertsSlice";
import realtimeMiddleware from "./middleware/realtimeMiddleware";

export const store = configureStore({
  reducer: {
    // Existing reducers
    sites: sitesReducer,
    devices: devicesReducer,
    tenGigLinks: tenGigLinksReducer,
    corePikudim: corePikudimReducer,
    favorites: favoritesReducer,
    netTypes: netTypesReducer,
    auth: authReducer,
    realtime: realtimeReducer,
    alerts: alertsReducer,
  },
  // This is needed because a `Set` is not serializable, which Redux DevTools prefers.
  // This is safe for this use case.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(realtimeMiddleware),
});
