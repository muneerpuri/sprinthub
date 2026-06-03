"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Collapse,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import BugReportIcon from "@mui/icons-material/BugReport";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useRouter } from "next/navigation";

/**
 * A themed MUI error fallback component.
 * Used inside DashboardLayout where MUI theme context is available.
 *
 * @param {{ error: Error, errorInfo: Object, resetError: Function }} props
 * @returns {JSX.Element}
 */
export default function ErrorFallbackUI({ error, errorInfo, resetError }) {
  const theme = useTheme();
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        px: 3,
        py: 6,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
          p: { xs: 4, sm: 5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: isDark
            ? "rgba(255,255,255,0.03)"
            : "rgba(255,255,255,0.8)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Icon with gradient background */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: isDark
              ? "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))"
              : "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <BugReportIcon
            sx={{
              fontSize: 40,
              color: "error.main",
              animation: "wiggle 1s ease-in-out",
              "@keyframes wiggle": {
                "0%, 100%": { transform: "rotate(0deg)" },
                "15%": { transform: "rotate(-12deg)" },
                "30%": { transform: "rotate(10deg)" },
                "45%": { transform: "rotate(-8deg)" },
                "60%": { transform: "rotate(6deg)" },
                "75%": { transform: "rotate(-3deg)" },
              },
            }}
          />
        </Box>

        <Typography
          variant="h5"
          fontWeight={800}
          sx={{
            mb: 1,
            background: "linear-gradient(135deg, #ef4444, #f97316)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Oops! Something broke
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 380, mx: "auto", lineHeight: 1.7 }}
        >
          This part of the app encountered an unexpected error. Your data is
          safe — try refreshing or head back to the dashboard.
        </Typography>

        {/* Error message card */}
        {error?.message && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2.5,
              borderColor: "error.main",
              borderStyle: "dashed",
              bgcolor: isDark
                ? "rgba(239,68,68,0.06)"
                : "rgba(239,68,68,0.04)",
              textAlign: "left",
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="error.main"
              sx={{
                display: "block",
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Error
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                color: "text.primary",
                wordBreak: "break-word",
                fontSize: "0.8rem",
              }}
            >
              {error.message}
            </Typography>
          </Paper>
        )}

        {/* Action buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            justifyContent: "center",
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={resetError}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.2,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(99,102,241,0.45)",
              },
            }}
          >
            Try Again
          </Button>

          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => router.push("/")}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.2,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Dashboard
          </Button>
        </Box>

        {/* Expandable stack trace (dev only) */}
        {process.env.NODE_ENV === "development" && errorInfo && (
          <Box sx={{ mt: 2 }}>
            <Button
              size="small"
              color="inherit"
              onClick={() => setShowDetails(!showDetails)}
              endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                color: "text.disabled",
              }}
            >
              {showDetails ? "Hide" : "Show"} Stack Trace
            </Button>
            <Collapse in={showDetails}>
              <Paper
                variant="outlined"
                sx={{
                  mt: 1,
                  p: 2,
                  maxHeight: 200,
                  overflow: "auto",
                  borderRadius: 2,
                  bgcolor: isDark
                    ? "rgba(0,0,0,0.3)"
                    : "rgba(0,0,0,0.03)",
                  textAlign: "left",
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: "0.7rem",
                    color: "text.secondary",
                    m: 0,
                  }}
                >
                  {errorInfo.componentStack}
                </Typography>
              </Paper>
            </Collapse>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
