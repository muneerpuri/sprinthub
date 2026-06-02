// src/app/layout.js
import "./globals.css";
import StoreProvider from "./StoreProvider";
import AuthGuard from "../components/auth/AuthGuard";
import ThemeContextProvider from "./ThemeContextProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

export const metadata = {
  title: "SprintHub",
  description: "Modern Task Management App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}