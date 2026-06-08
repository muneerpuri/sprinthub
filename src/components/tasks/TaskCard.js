"use client";
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function TaskCard({ task, onClick, onDelete }) {
  if (!task) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "error";
      case "medium": return "warning";
      case "low": return "success";
      default: return "default";
    }
  };

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  return (
    <Card
      onClick={() => onClick(task)}
      elevation={0}
      sx={{
        mb: 2,
        cursor: "grab",
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 12px 24px -4px rgba(99, 102, 241, 0.15)",
        },
        "&:active": { cursor: "grabbing" },
      }}
    >
      <CardContent sx={{ pb: "16px !important", p: 2 }}>
        {/* Labels Row */}
        {task.labels && task.labels.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
            {task.labels.map((lbl) => (
              <Chip
                key={lbl}
                label={lbl}
                size="small"
                sx={{ height: 20, fontSize: "0.65rem", bgcolor: "action.hover" }}
              />
            ))}
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, pr: 2 }}>
            {task.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: -0.5, mr: -1 }}>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Footer info */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {task.priority && (
              <Chip
                label={task.priority}
                size="small"
                color={getPriorityColor(task.priority)}
                sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold", textTransform: "uppercase" }}
              />
            )}
            {task.storyPoints && (
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                {task.storyPoints} pt
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {formattedDate && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                <CalendarTodayIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" fontWeight="500">{formattedDate}</Typography>
              </Box>
            )}
           {task.assignee ? (
  <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: "primary.main" }} title={`${task.assignee.firstName} ${task.assignee.lastName}`}>
    {task.assignee.firstName?.charAt(0)}{task.assignee.lastName?.charAt(0)}
  </Avatar>
) : (
  <AccountCircleIcon sx={{ fontSize: 24, color: "text.disabled" }} title="Unassigned" />
)}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}