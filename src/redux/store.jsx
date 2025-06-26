// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import sitesReducer from "./slices/sitesSlice";
import devicesReducer from "./slices/devicesSlice";
import tenGigLinksReducer from "./slices/tenGigLinksSlice";
import corePikudimReducer from "./slices/corePikudimSlice";
import favoritesReducer from "./slices/favoritesSlice";
import netTypesReducer from "./slices/netTypesSlice";

export const store = configureStore({
  reducer: {
    sites: sitesReducer,
    devices: devicesReducer,
    tenGigLinks: tenGigLinksReducer,
    corePikudim: corePikudimReducer,
    favorites: favoritesReducer,
    netTypes: netTypesReducer,
  },
  // This is needed because a `Set` is not serializable, which Redux DevTools prefers.
  // This is safe for this use case.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
