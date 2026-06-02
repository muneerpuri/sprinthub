// src/components/tasks/TaskCard.js
"use client";
import React from "react";
import { Card, CardContent, Typography, Box, Chip, IconButton, Avatar } from "@mui/material";
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

  // Format Due Date cleanly
  const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;

  return (
     <Card
      onClick={() => onClick(task)}
      sx={{
        mb: 2, cursor: "grab", borderRadius: 2, border: "1px solid", borderColor: "divider",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        transition: "all 0.2s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 16px rgba(0,0,0,0.08)", borderColor: "primary.main" },
      }}
    >
      <CardContent sx={{ pb: "16px !important", p: 2 }}>
        {/* Labels Row */}
        {task.labels && task.labels.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
            {task.labels.map(lbl => (
              <Chip key={lbl} label={lbl} size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "action.hover" }} />
            ))}
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, pr: 2 }}>
            {task.title}
          </Typography>
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(task); }} sx={{ mt: -0.5, mr: -1 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Footer info: priority, pts, date, assignee */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {task.priority && (
              <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold", textTransform: "uppercase" }} />
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
            {/* Show Assignee / Owner Avatar */}
            {task.ownerId ? (
               <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: "primary.main" }}>U</Avatar>
            ) : (
               <AccountCircleIcon sx={{ fontSize: 22, color: "text.disabled" }} />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}