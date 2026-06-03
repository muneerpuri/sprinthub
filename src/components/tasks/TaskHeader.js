"use client";
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

/**
 * @typedef {Object} TaskHeaderProps
 * @property {function(): void} onCreateClick - Callback function to be called when the "Create Task" button is clicked.
 */

/**
 * TaskHeader component displays the title for the Kanban board and a button to create new tasks.
 *
 * @param {TaskHeaderProps} props - The component props.
 * @returns {JSX.Element} The TaskHeader component.
 */
export default function TaskHeader({ onCreateClick }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 3, md: 6 },
        py: 3,
        borderBottom: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
      }}
    >
      <Typography variant="h5" fontWeight="bold" color="#0f172a">
        Kanban Board
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={onCreateClick}
        sx={{
          textTransform: "none",
          fontWeight: "bold",
          borderRadius: 2,
          px: 3,
        }}
      >
        Create Task
      </Button>
    </Box>
  );
}
