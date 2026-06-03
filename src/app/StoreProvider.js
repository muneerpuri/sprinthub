"use client";
import { Provider } from "react-redux";
import { store } from "../lib/store";

/**
 * @typedef {Object} StoreProviderProps
 * @property {React.ReactNode} children - The children to be rendered within the provider.
 */

/**
 * StoreProvider component that wraps the application with the Redux store.
 * @param {StoreProviderProps} props - The component props.
 * @returns {JSX.Element} The Redux Provider component.
 */
export default function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
