"use client";
import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Box, FormControlLabel, Switch
} from "@mui/material";
import { useGetWorkspacesQuery } from "../../lib/apiSlice";

const validationSchema = yup.object({
  name: yup.string().required("Project name is required").trim(),
  workspaceId: yup.string().required("Workspace is required"),
  description: yup.string().nullable(),
  color: yup.string().nullable(),
  isArchived: yup.boolean(),
});

export default function ProjectModal({
  open, onClose, onSave, isEditing,
  initialValues = { name: "", workspaceId: "", description: "", color: "#3b82f6", isArchived: false },
}) {
  const { data: workspaces = [] } = useGetWorkspacesQuery();

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSave({ ...values, name: values.name.trim() });
    },
  });

  // Auto-select first workspace if creating a new project
  useEffect(() => {
    if (open && !isEditing && workspaces.length > 0 && !formik.values.workspaceId) {
      formik.setFieldValue("workspaceId", workspaces[0].id);
    }
  }, [open, workspaces, isEditing, formik]);

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
            
            <FormControl fullWidth required error={formik.touched.workspaceId && Boolean(formik.errors.workspaceId)}>
              <InputLabel>Workspace</InputLabel>
              <Select
                name="workspaceId"
                value={formik.values.workspaceId || ""}
                label="Workspace"
                onChange={formik.handleChange}
                disabled={isEditing} // Usually, projects don't change workspaces after creation
              >
                {workspaces.map((ws) => (
                  <MenuItem key={ws.id} value={ws.id}>{ws.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Project Name" name="name" value={formik.values.name}
              onChange={formik.handleChange} onBlur={formik.handleBlur} fullWidth required
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
              label="Description" name="description" value={formik.values.description || ""}
              onChange={formik.handleChange} onBlur={formik.handleBlur} fullWidth multiline rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Project Theme Color</InputLabel>
              <Select name="color" value={formik.values.color || "#3b82f6"} label="Project Theme Color" onChange={formik.handleChange}>
                <MenuItem value="#3b82f6">Blue</MenuItem>
                <MenuItem value="#10b981">Green</MenuItem>
                <MenuItem value="#8b5cf6">Purple</MenuItem>
                <MenuItem value="#f59e0b">Orange</MenuItem>
                <MenuItem value="#ef4444">Red</MenuItem>
              </Select>
            </FormControl>

            {isEditing && (
              <FormControlLabel
                control={<Switch checked={formik.values.isArchived || false} onChange={formik.handleChange} name="isArchived" color="primary" />}
                label="Archive this project"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={!formik.dirty || !formik.isValid}>
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}