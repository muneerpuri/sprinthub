import React from "react";
import { Box, Typography, Paper, Skeleton, useTheme } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";

/**
 * @typedef {Object} PriorityChartProps
 * @property {number} high - The count of high priority tasks.
 * @property {number} medium - The count of medium priority tasks.
 * @property {number} low - The count of low priority tasks.
 * @property {boolean} isLoading - Whether the data is currently loading.
 */

/**
 * Displays a bar chart breakdown of tasks by priority.
 *
 * @param {PriorityChartProps} props - The component props.
 * @returns {JSX.Element}
 */
export default function PriorityChart({ high, medium, low, isLoading }) {
  const theme = useTheme();
  const total = high + medium + low || 1;

  const priorities = [
    { label: "High", value: high, color: theme.palette.error.main },
    { label: "Medium", value: medium, color: theme.palette.warning.main },
    { label: "Low", value: low, color: theme.palette.success.main },
  ];

  if (isLoading) {
    return <Skeleton variant="rounded" height={200} />;
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <FlagIcon sx={{ mr: 1, color: "text.secondary" }} />
        <Typography variant="h6" fontWeight="bold">
          Tasks by Priority
        </Typography>
      </Box>

      {priorities.map((p) => (
        <Box key={p.label} sx={{ mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="body2" fontWeight={500}>
              {p.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {p.value}
            </Typography>
          </Box>
          <Box
            sx={{
              height: 8,
              bgcolor: "divider",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${(p.value / total) * 100}%`,
                bgcolor: p.color,
                borderRadius: 4,
              }}
            />
          </Box>
        </Box>
      ))}
    </Paper>
  );
}
