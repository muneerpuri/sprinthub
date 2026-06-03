import React from "react";
import { Box, Typography, Button, Chip, Avatar, Grid } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

/**
 * @typedef {Object} ProjectHeaderProps
 * @property {Object} project - The project data object.
 * @property {boolean} canEdit - Whether the user has permission to edit.
 * @property {boolean} canDelete - Whether the user has permission to delete.
 * @property {Function} onEdit - Handler to open the edit modal.
 * @property {Function} onDelete - Handler to delete the project.
 */

/**
 * Displays the project's header, description, and owner details.
 *
 * @param {ProjectHeaderProps} props - The component props.
 * @returns {JSX.Element}
 */
export default function ProjectHeader({
  project,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) {
  const ownerName = project?.owner
    ? `${project.owner.firstName || ""} ${project.owner.lastName || ""}`.trim()
    : "No Owner";
  const ownerEmail = project?.owner?.email || null;
  const ownerInitials = project?.owner
    ? `${project.owner.firstName?.[0] || ""}${project.owner.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          height: 8,
          width: "100%",
          bgcolor: project?.color || "#3b82f6",
          borderRadius: "4px 4px 0 0",
          mb: 2,
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {project?.name || "Project"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
            <Chip
              label={project?.isArchived ? "Archived" : "Active"}
              color={project?.isArchived ? "default" : "primary"}
              variant="outlined"
              size="small"
            />
            <Typography variant="caption" color="text.disabled">
              Created:{" "}
              {project?.createdAt
                ? new Date(project.createdAt).toLocaleDateString()
                : ""}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item="true" size={{ xs: 12, md: 7 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            fontWeight="bold"
          >
            Project Description
          </Typography>
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-line", color: "text.primary" }}
          >
            {project?.description || "No description provided."}
          </Typography>
        </Grid>

        <Grid item="true" size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              fontWeight="bold"
            >
              Project Owner
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}
            >
              <Avatar
                sx={{
                  bgcolor: project?.color || "primary.main",
                  width: 40,
                  height: 40,
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                {ownerInitials || <AccountCircleIcon />}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {ownerName}
                </Typography>
                {ownerEmail && (
                  <Typography variant="caption" color="text.secondary">
                    {ownerEmail}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
