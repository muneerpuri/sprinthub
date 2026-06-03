import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";

/**
 * Configures and exports the Redux store.
 * Integrates the RTK Query API slice and its middleware.
 */
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
