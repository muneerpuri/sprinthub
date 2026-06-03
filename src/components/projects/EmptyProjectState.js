import React from "react";
import { Box, Typography, Button } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

/**
 * @typedef {Object} EmptyProjectStateProps
 * @property {Function} onAction - Handler for the create project button.
 */

/**
 * Displays an empty state indicating no projects were found.
 *
 * @param {EmptyProjectStateProps} props - The component props.
 * @returns {JSX.Element}
 */
export default function EmptyProjectState({ onAction }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        mt: 10,
        p: 4,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
      }}
    >
      <FolderOpenIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        No projects found
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
        Create a project to start organizing your tasks.
      </Typography>
      <Button variant="outlined" onClick={onAction}>
        Create your first project
      </Button>
    </Box>
  );
}
