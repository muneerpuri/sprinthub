import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";

/**
 * Configures and exports the Redux store.
 * It includes the API slice reducer and middleware.
 */
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
