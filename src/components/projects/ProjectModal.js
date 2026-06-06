"use client";
import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
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

const validationSchema = yup.object({
  name: yup
    .string()
    .required("Project name is required")
    .test(
      "not-only-whitespace",
      "Project name cannot be empty or only spaces",
      (val) => val && val.trim().length > 0,
    ),
  description: yup.string().nullable(),
  color: yup.string().nullable(),
  isArchived: yup.boolean(),
});

/**
 * @typedef {Object} ProjectModalProps
 * @property {boolean} open - Whether the modal is open.
 * @property {function(): void} onClose - Callback function to close the modal.
 * @property {function(Object): void} onSave - Callback function to save the project with validated form values.
 * @property {boolean} isEditing - Whether the modal is in editing mode.
 * @property {Object} [initialValues] - Initial form values for editing.
 */

/**
 * ProjectModal component for creating or editing project details.
 * Uses Formik for form state management and Yup for validation.
 *
 * @param {ProjectModalProps} props - The component props.
 * @returns {JSX.Element} The ProjectModal component.
 */
export default function ProjectModal({
  open,
  onClose,
  onSave,
  isEditing,
  initialValues = { name: "", description: "", color: "#3b82f6", isArchived: false },
}) {
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSave({ ...values, name: values.name.trim() });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">
        {isEditing ? "Edit Project" : "Create New Project"}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <TextField
              label="Project Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              required
              placeholder="e.g., Marketing Website Redesign"
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
              label="Description"
              name="description"
              value={formik.values.description || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Project Theme Color</InputLabel>
              <Select
                name="color"
                value={formik.values.color || "#3b82f6"}
                label="Project Theme Color"
                onChange={formik.handleChange}
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
                    checked={formik.values.isArchived || false}
                    onChange={formik.handleChange}
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
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!formik.dirty || !formik.isValid}
          >
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

