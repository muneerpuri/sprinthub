import React from "react";
import { Card, CardContent, Box, Typography, Chip } from "@mui/material";

/**
 * @typedef {Object} Project
 * @property {string} id - The project identifier.
 * @property {string} name - The name of the project.
 * @property {string} [description] - The project description.
 * @property {string} [color] - The project's theme color.
 * @property {boolean} isArchived - Whether the project is archived.
 * @property {string} createdAt - The creation date string.
 */

/**
 * @typedef {Object} ProjectCardProps
 * @property {Project} project - The project data to display.
 * @property {Function} onClick - Handler for when the card is clicked.
 */

/**
 * Displays a summary card for a project.
 *
 * @param {ProjectCardProps} props - The component props.
 * @returns {JSX.Element}
 */
export default function ProjectCard({ project, onClick }) {
  return (
    <Card
      onClick={onClick}
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: project.color || "primary.main",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          height: 6,
          width: "100%",
          bgcolor: project.color || "#3b82f6",
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography variant="h6" fontWeight="bold" noWrap title={project.name}>
            {project.name}
          </Typography>
          {project.isArchived && (
            <Chip label="Archived" size="small" color="default" variant="outlined" />
          )}
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description || "No description provided."}
        </Typography>
      </CardContent>

      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="caption" color="text.disabled">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </Typography>
      </Box>
    </Card>
  );
}