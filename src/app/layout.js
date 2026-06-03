import "./globals.css";
import StoreProvider from "./StoreProvider";
import AuthGuard from "../components/auth/AuthGuard";
import ThemeContextProvider from "./ThemeContextProvider";
import ErrorBoundary from "../components/error/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

/**
 * Metadata for the application.
 * @type {Object}
 * @property {string} title - The title of the application.
 * @property {string} description - The description of the application.
 */
export const metadata = {
  title: "SprintHub",
  description: "Modern Task Management App",
};

/**
 * @typedef {Object} RootLayoutProps
 * @property {React.ReactNode} children - The children to be rendered within the layout.
 */

/**
 * RootLayout component that provides the overall structure and context for the application.
 * It includes global styles, Redux store, authentication guard, theme provider, and toast notifications.
 *
 * @param {RootLayoutProps} props - The component props.
 * @returns {JSX.Element} The root HTML structure with various providers.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AppRouterCacheProvider>
            <ThemeContextProvider>
              <StoreProvider>
                <AuthGuard>
                  <ToastContainer position="top-right" autoClose={3000} />
                  {children}
                </AuthGuard>
              </StoreProvider>
            </ThemeContextProvider>
          </AppRouterCacheProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
