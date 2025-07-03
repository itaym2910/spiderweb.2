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
    // These are the "keys" that become state.sites, state.devices, etc.
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
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(realtimeMiddleware),
});
