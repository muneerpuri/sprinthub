import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

/**
 * @typedef {Object} ProjectTasksTabProps
 * @property {Array} tasks - Array of task objects.
 * @property {boolean} isLoading - Loading state for tasks.
 * @property {string} projectColor - Theme color of the project.
 */

/**
 * Displays the project's task list and completion progress.
 *
 * @param {ProjectTasksTabProps} props - The component props.
 * @returns {JSX.Element}
 */
export default function ProjectTasksTab({ tasks, isLoading, projectColor }) {
  const completedTasks = tasks.filter(
    (t) => (t.status || "").toUpperCase() === "COMPLETED",
  ).length;
  const totalTasks = tasks.length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssignmentIcon color="action" />
          <Typography variant="subtitle1" fontWeight="bold">
            Tasks ({totalTasks})
          </Typography>
        </Box>
        {totalTasks > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight="medium"
          >
            {completedTasks}/{totalTasks} Completed ({completionPercentage}%)
          </Typography>
        )}
      </Box>

      {totalTasks > 0 && (
        <LinearProgress
          variant="determinate"
          value={completionPercentage}
          sx={{
            mb: 3,
            height: 6,
            borderRadius: 3,
            bgcolor: "action.hover",
            "& .MuiLinearProgress-bar": {
              bgcolor: projectColor || "primary.main",
            },
          }}
        />
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      ) : totalTasks === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "action.hover",
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No tasks created yet for this project.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {tasks.map((task) => {
            const formattedDate = task.dueDate
              ? new Date(task.dueDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : null;
            const statusUpper = (task.status || "PENDING").toUpperCase();
            const statusColor =
              statusUpper === "COMPLETED"
                ? "success"
                : statusUpper === "IN_PROGRESS"
                  ? "info"
                  : "default";
            const statusText =
              statusUpper === "COMPLETED"
                ? "Done"
                : statusUpper === "IN_PROGRESS"
                  ? "In Progress"
                  : "To Do";

            return (
              <Card
                key={task.id}
                variant="outlined"
                sx={{
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <CardContent
                  sx={{
                    p: 2,
                    "&:last-child": { pb: 2 },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 200, flex: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ lineBreak: "anywhere" }}
                    >
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          lineBreak: "anywhere",
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Chip
                      label={statusText}
                      size="small"
                      color={statusColor}
                      variant="outlined"
                      sx={{
                        height: 22,
                        fontSize: "0.7rem",
                        fontWeight: "medium",
                      }}
                    />
                    {task.priority && (
                      <Chip
                        label={task.priority}
                        size="small"
                        color={getPriorityColor(task.priority)}
                        sx={{
                          height: 22,
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                      />
                    )}
                    {task.storyPoints && (
                      <Typography
                        variant="caption"
                        fontWeight="bold"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {task.storyPoints} pt
                      </Typography>
                    )}
                    {formattedDate && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "text.secondary",
                        }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: 12 }} />
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.75rem" }}
                        >
                          {formattedDate}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
