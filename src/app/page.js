"use client";
import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Skeleton,
  useTheme,
} from "@mui/material";
import {
  AssignmentTurnedIn as CompletedIcon,
  HourglassEmpty as PendingIcon,
  ListAlt as TotalTasksIcon,
  PriorityHigh as HighPriorityIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";

import DashboardLayout from "../components/layout/DashboardLayout";
import { useGetTasksQuery } from "../lib/apiSlice";

/**
 * @typedef {Object} StatCardProps
 * @property {string} title - The title of the statistic.
 * @property {number} value - The value of the statistic.
 * @property {React.ReactNode} icon - The icon to display.
 * @property {string} color - The color for the card's border and icon background.
 * @property {boolean} isLoading - Whether the data is currently loading.
 */

/**
 * Reusable Stat Card Component to display a single statistic.
 *
 * @param {StatCardProps} props - The component props.
 * @returns {JSX.Element} A Material-UI Paper component displaying the statistic.
 */
function StatCard({ title, value, icon, color, isLoading }) {
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

/**
 * @typedef {Object} PriorityChartProps
 * @property {number} high - The count of high priority tasks.
 * @property {number} medium - The count of medium priority tasks.
 * @property {number} low - The count of low priority tasks.
 * @property {boolean} isLoading - Whether the data is currently loading.
 */

/**
 * Reusable Priority Bar Chart Component to display tasks by priority.
 *
 * @param {PriorityChartProps} props - The component props.
 * @returns {JSX.Element} A Material-UI Paper component displaying the priority breakdown.
 */
function PriorityChart({ high, medium, low, isLoading }) {
  const total = high + medium + low || 1; // Avoid division by zero
  const theme = useTheme();

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

/**
 * DashboardPage component that displays an overview of tasks and their statistics.
 * It fetches tasks data and presents it using StatCards and a PriorityChart.
 *
 * @returns {JSX.Element} The dashboard layout with task statistics.
 */
export default function DashboardPage() {
  const { data: tasks = [], isLoading } = useGetTasksQuery();
  const theme = useTheme();

  // --- METRIC CALCULATIONS ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const pendingTasks = tasks.filter(
    (t) => t.status === "PENDING" || t.status === "IN_PROGRESS",
  ).length;

  const highPriorityCount = tasks.filter((t) => t.priority === "high").length;
  const mediumPriorityCount = tasks.filter(
    (t) => t.priority === "medium",
  ).length;
  const lowPriorityCount = tasks.filter((t) => t.priority === "low").length;

  const statCards = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: <TotalTasksIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: <CompletedIcon />,
      color: theme.palette.success.main,
    },
    {
      title: "Pending / In Progress",
      value: pendingTasks,
      icon: <PendingIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: "High Priority",
      value: highPriorityCount,
      icon: <HighPriorityIcon />,
      color: theme.palette.error.main,
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here's a snapshot of your current workload.
        </Typography>
      </Box>

      {/* Main Grid */}
      <Grid container spacing={3}>
        {/* Stat Cards */}
        {statCards.map((card) => (
          <Grid item="true" size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
            <StatCard {...card} isLoading={isLoading} />
          </Grid>
        ))}

        {/* Priority Breakdown Chart */}
        <Grid item="true" size={{ xs: 12, md: 6 }}>
          <PriorityChart
            high={highPriorityCount}
            medium={mediumPriorityCount}
            low={lowPriorityCount}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
