"use client";

import React from "react";
import { Box, Typography, Grid, useTheme } from "@mui/material";
import {
  AssignmentTurnedIn as CompletedIcon,
  HourglassEmpty as PendingIcon,
  ListAlt as TotalTasksIcon,
  PriorityHigh as HighPriorityIcon,
} from "@mui/icons-material";

import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import PriorityChart from "../components/dashboard/PriorityChart";
import { useGetTasksQuery } from "../lib/apiSlice";

/**
 * Primary dashboard view summarizing user workload and task metrics.
 *
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
  const { data: tasks = [], isLoading } = useGetTasksQuery();
  const theme = useTheme();

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here's a snapshot of your current workload.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item="true" size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
            <StatCard {...card} isLoading={isLoading} />
          </Grid>
        ))}

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
