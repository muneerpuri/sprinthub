"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";

/**
 * @typedef {Object} ProjectForm
 * @property {string} name - The name of the project.
 * @property {string} [description] - The description of the project.
 * @property {string} [color] - The theme color of the project.
 * @property {boolean} [isArchived] - Whether the project is archived.
 */

/**
 * @typedef {Object} ProjectModalProps
 * @property {boolean} open - Whether the modal is open.
 * @property {function(): void} onClose - Callback function to close the modal.
 * @property {ProjectForm} form - The form data for the project.
 * @property {function(ProjectForm): void} setForm - Function to update the form data.
 * @property {function(): void} onSave - Callback function to save the project.
 * @property {boolean} isEditing - Whether the modal is in editing mode.
 */

/**
 * ProjectModal component for creating or editing project details.
 *
 * @param {ProjectModalProps} props - The component props.
 * @returns {JSX.Element} The ProjectModal component.
 */
export default function ProjectModal({
  open,
  onClose,
  form,
  setForm,
  onSave,
  isEditing,
}) {
  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">
        {isEditing ? "Edit Project" : "Create New Project"}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Project Name"
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            fullWidth
            required
            placeholder="e.g., Marketing Website Redesign"
          />

          <TextField
            label="Description"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />

          <FormControl fullWidth>
            <InputLabel>Project Theme Color</InputLabel>
            <Select
              name="color"
              value={form.color || "#3b82f6"}
              label="Project Theme Color"
              onChange={handleChange}
            >
              <MenuItem value="#3b82f6">Blue</MenuItem>
              <MenuItem value="#10b981">Green</MenuItem>
              <MenuItem value="#8b5cf6">Purple</MenuItem>
              <MenuItem value="#f59e0b">Orange</MenuItem>
              <MenuItem value="#ef4444">Red</MenuItem>
            </Select>
          </FormControl>

          {isEditing && (
            <FormControlLabel
              control={
                <Switch
                  checked={form.isArchived || false}
                  onChange={handleChange}
                  name="isArchived"
                  color="primary"
                />
              }
              label="Archive this project"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          disabled={!form.name}
        >
          {isEditing ? "Save Changes" : "Create Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
