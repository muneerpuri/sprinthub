"use client";
import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, Autocomplete } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useGetLabelsQuery, useAddLabelMutation, useGetWorkspacesQuery } from "../../lib/apiSlice";
import { useGetProjectMembersQuery } from "../../lib/apiSlice";
const validationSchema = yup.object({
  title: yup.string().required("Task title is required"),
  description: yup.string().nullable(),
  dueDate: yup.string().required("Due date is required"),
  priority: yup.string().nullable(),
});

export default function CreateTaskModal({ open, onClose, onCreate, projectId }) {
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const activeWorkspace = workspaces[0]?.id; // Simplification: auto-select first workspace
    const { data: members = [] } = useGetProjectMembersQuery(projectId, { skip: !projectId });
  const { data: labelsData = [] } = useGetLabelsQuery(activeWorkspace, { skip: !activeWorkspace });
  const [addLabel] = useAddLabelMutation();

  const formik = useFormik({
    initialValues: { assigneeId: "" , title: "", description: "", dueDate: "", priority: "medium", storyPoints: 1, labels: [] },
    validationSchema,
    onSubmit: (values) => onCreate({ ...values, title: values.title.trim() }),
  });

  const handleLabelChange = async (event, newValue) => {
    const processedLabels = await Promise.all(newValue.map(async (val) => {
      if (typeof val === 'string') {
        // User typed a new label
        const res = await addLabel({ name: val, workspaceId: activeWorkspace }).unwrap();
        return res[0].name;
      }
      return val.name || val;
    }));
    formik.setFieldValue("labels", processedLabels);
  };

  return (
    <Dialog open={open} onClose={() => { formik.resetForm(); onClose(); }} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">Create New Task</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField label="Title" name="title" value={formik.values.title} onChange={formik.handleChange} fullWidth required />
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker label="Due Date" value={formik.values.dueDate ? dayjs(formik.values.dueDate) : null} onChange={(val) => formik.setFieldValue("dueDate", val ? val.toISOString() : null)} />
            </LocalizationProvider>

            <TextField label="Description" name="description" value={formik.values.description} onChange={formik.handleChange} fullWidth multiline rows={3} />
            
            <Autocomplete
              multiple
              freeSolo
              options={labelsData.map((option) => option.name)}
              value={formik.values.labels}
              onChange={handleLabelChange}
              renderInput={(params) => <TextField {...params} label="Labels" placeholder="Type and press enter" />}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select name="priority" value={formik.values.priority} onChange={formik.handleChange}>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
    <InputLabel>Assign To</InputLabel>
    <Select name="assigneeId" value={formik.values.assigneeId} onChange={formik.handleChange}>
      <MenuItem value=""><em>Unassigned</em></MenuItem>
      {members.map((member) => (
        <MenuItem key={member.userId} value={member.userId}>
          {member.users?.firstName} {member.users?.lastName}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={!formik.isValid}>Create Task</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}