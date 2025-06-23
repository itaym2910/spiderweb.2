import { configureStore } from "@reduxjs/toolkit";
import corePikudimReducer from "./slices/corePikudimSlice";
import devicesReducer from "./slices/devicesSlice";
import sitesReducer from "./slices/sitesSlice";
import netTypesReducer from "./slices/netTypesSlice";
import tenGigLinksReducer from "./slices/tenGigLinksSlice";

export const store = configureStore({
  reducer: {
    corePikudim: corePikudimReducer,
    devices: devicesReducer,
    sites: sitesReducer,
    netTypes: netTypesReducer,
    tenGigLinks: tenGigLinksReducer,
  },
});
