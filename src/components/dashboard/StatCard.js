import React from "react";
import { Box, Typography, Paper, Skeleton } from "@mui/material";

/**
 * @typedef {Object} StatCardProps
 * @property {string} title - The title of the statistic.
 * @property {number} value - The value of the statistic.
 * @property {React.ReactNode} icon - The icon to display.
 * @property {string} color - The color for the card's border and icon background.
 * @property {boolean} isLoading - Whether the data is currently loading.
 */

/**
 * Displays a single statistic card.
 *
 * @param {StatCardProps} props - The component props.
 * @returns {JSX.Element}
 */
export default function StatCard({ title, value, icon, color, isLoading }) {
  if (isLoading) {
    return <Skeleton variant="rounded" height={120} />;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        display: "flex",
        alignItems: "center",
        height: "100%",
        borderLeft: 4,
        borderColor: color,
      }}
    >
      <Box
        sx={{
          bgcolor: color,
          color: "#fff",
          borderRadius: "50%",
          p: 1.5,
          display: "grid",
          placeItems: "center",
          mr: 2.5,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Paper>
  );
}
