"use client";
import React, { createContext, useState, useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

/**
 * Context for managing color mode (light/dark).
 * Provides a toggle function for switching between modes.
 * @type {React.Context<{toggleColorMode: () => void}>}
 */
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

/**
 * @typedef {Object} ThemeContextProviderProps
 * @property {React.ReactNode} children - The children to be rendered within the theme provider.
 */

/**
 * ThemeContextProvider component that provides Material-UI theme and color mode context to the application.
 * It manages the light/dark mode state and creates a theme based on the current mode.
 *
 * @param {ThemeContextProviderProps} props - The component props.
 * @returns {JSX.Element} The ThemeProvider and ColorModeContext.Provider components.
 */
export default function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#6366f1", // Modern Indigo
            light: "#818cf8",
            dark: "#4f46e5",
          },
          secondary: {
            main: "#ec4899", // Vibrant Pink
          },
          background: {
            default: mode === "light" ? "#f8fafc" : "#0f172a", // Slate 50 / Slate 900
            paper: mode === "light" ? "#ffffff" : "#1e293b",
          },
          text: {
            primary: mode === "light" ? "#0f172a" : "#f8fafc",
            secondary: mode === "light" ? "#64748b" : "#94a3b8",
          },
          divider: mode === "light" ? "#e2e8f0" : "#334155",
        },
        typography: {
          fontFamily: '"Inter", "system-ui", "sans-serif"',
          h4: { fontWeight: 700, letterSpacing: "-0.02em" },
          h5: { fontWeight: 600, letterSpacing: "-0.01em" },
          h6: { fontWeight: 600 },
          button: { textTransform: "none", fontWeight: 600 },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
              root: {
                borderRadius: "8px",
                padding: "8px 16px",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                boxShadow:
                  mode === "light"
                    ? "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)"
                    : "0 4px 6px -1px rgb(0 0 0 / 0.2)",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: "16px",
                border: `1px solid ${mode === "light" ? "#e2e8f0" : "#334155"}`,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  transition: "all 0.2s",
                  "&.Mui-focused": {
                    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.2)",
                  },
                },
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: { borderRadius: "16px", padding: "8px" },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
