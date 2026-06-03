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
  OutlinedInput,
  Chip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useGetProjectsQuery } from "../../lib/apiSlice";

const AVAILABLE_LABELS = [
  "Bug",
  "Feature",
  "Enhancement",
  "Documentation",
  "Design",
];

/**
 * @typedef {Object} TaskForm
 * @property {string} title - The title of the task.
 * @property {string} [projectId] - The ID of the project the task belongs to.
 * @property {string} [dueDate] - The due date of the task in ISO format.
 * @property {string} [description] - The description of the task.
 * @property {string} [priority] - The priority of the task (e.g., "high", "medium", "low").
 * @property {number} [storyPoints] - The story points assigned to the task.
 * @property {string[]} [labels] - An array of labels for the task.
 */

/**
 * @typedef {Object} CreateTaskModalProps
 * @property {boolean} open - Whether the modal is open.
 * @property {function(): void} onClose - Callback function to close the modal.
 * @property {TaskForm} form - The form data for the new task.
 * @property {function(TaskForm): void} setForm - Function to update the form data.
 * @property {function(): void} onCreate - Callback function to create the task.
 */

/**
 * CreateTaskModal component for creating new tasks.
 *
 * @param {CreateTaskModalProps} props - The component props.
 * @returns {JSX.Element} The CreateTaskModal component.
 */
export default function CreateTaskModal({
  open,
  onClose,
  form,
  setForm,
  onCreate,
}) {
  const { data: projects = [] } = useGetProjectsQuery();

  const handleChange = (e) => {
    const value =
      e.target.name === "storyPoints"
        ? e.target.value
          ? Number(e.target.value)
          : null
        : e.target.value;

    setForm({ ...form, [e.target.name]: value });
  };

  const handleDateChange = (newValue) => {
    setForm({
      ...form,
      dueDate: newValue ? newValue.toISOString() : null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">Create New Task</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Title"
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            fullWidth
            required
          />

          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select
                name="projectId"
                value={form.projectId || ""}
                label="Project"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {projects.map((proj) => (
                  <MenuItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Due Date"
                value={form.dueDate ? dayjs(form.dueDate) : null}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>

          <TextField
            label="Description"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={form.priority || "medium"}
                label="Priority"
                onChange={handleChange}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Story Points</InputLabel>
              <Select
                name="storyPoints"
                value={form.storyPoints || ""}
                label="Story Points"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={8}>8</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Labels</InputLabel>
            <Select
              multiple
              name="labels"
              value={form.labels || []}
              onChange={handleChange}
              input={<OutlinedInput label="Labels" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {AVAILABLE_LABELS.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onCreate} variant="contained" color="primary">
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}
