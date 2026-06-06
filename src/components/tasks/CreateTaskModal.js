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
  OutlinedInput,
  Chip,
  useMediaQuery,
  useTheme,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useGetProjectsListQuery } from "../../lib/apiSlice";

const AVAILABLE_LABELS = [
  "Bug",
  "Feature",
  "Enhancement",
  "Documentation",
  "Design",
];

const validationSchema = yup.object({
  title: yup
    .string()
    .required("Task title is required")
    .test(
      "not-only-whitespace",
      "Task title cannot be empty or only spaces",
      (val) => val && val.trim().length > 0,
    ),
  projectId: yup
    .string()
    .required("Project is required – tasks must belong to a project"),
  description: yup.string().nullable(),
  dueDate: yup.string().required("Due date is required"),
  priority: yup.string().nullable(),
  storyPoints: yup.number().nullable(),
  labels: yup.array().of(yup.string()).nullable(),
});

/**
 * @typedef {Object} CreateTaskModalProps
 * @property {boolean} open - Whether the modal is open.
 * @property {function(): void} onClose - Callback function to close the modal.
 * @property {function(Object): void} onCreate - Callback function to create the task with validated form values.
 * @property {Object} [initialValues] - Initial form values.
 */

/**
 * CreateTaskModal component for creating new tasks.
 * Uses Formik for form state management and Yup for validation.
 *
 * @param {CreateTaskModalProps} props - The component props.
 * @returns {JSX.Element} The CreateTaskModal component.
 */
export default function CreateTaskModal({
  open,
  onClose,
  onCreate,
  initialValues = {
    title: "",
    projectId: "",
    description: "",
    dueDate: "",
    priority: "medium",
    storyPoints: 1,
    labels: [],
  },
}) {
  const { data: projects = [] } = useGetProjectsListQuery();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onCreate({ ...values, title: values.title.trim() });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const handleDateChange = (newValue) => {
    formik.setFieldValue("dueDate", newValue ? newValue.toISOString() : null);
    formik.setFieldTouched("dueDate", true, false);
  };

  const selectedProject = projects.find(
    (p) => p.id === formik.values.projectId,
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
    >
      <DialogTitle fontWeight="bold">Create New Task</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}
          >
            <TextField
              label="Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              required
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              <Autocomplete
                options={projects}
                getOptionLabel={(option) => option.name || ""}
                value={selectedProject || null}
                onChange={(_, newValue) => {
                  formik.setFieldValue("projectId", newValue?.id || "");
                  formik.setFieldTouched("projectId", true, false);
                }}
                onBlur={() => formik.setFieldTouched("projectId", true, true)}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Project *"
                    placeholder="Search projects..."
                    error={
                      formik.touched.projectId &&
                      Boolean(formik.errors.projectId)
                    }
                    helperText={
                      formik.touched.projectId && formik.errors.projectId
                    }
                  />
                )}
                size="medium"
                fullWidth
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Due Date *"
                  value={
                    formik.values.dueDate ? dayjs(formik.values.dueDate) : null
                  }
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.dueDate &&
                        Boolean(formik.errors.dueDate),
                      helperText:
                        formik.touched.dueDate && formik.errors.dueDate,
                      onBlur: () =>
                        formik.setFieldTouched("dueDate", true, true),
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>

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

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formik.values.priority || "medium"}
                  label="Priority"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              <FormControl fullWidth>
                <InputLabel>Story Points</InputLabel>
                <Select
                  name="storyPoints"
                  value={formik.values.storyPoints ?? ""}
                  label="Story Points"
                  onChange={(e) => {
                    formik.setFieldValue(
                      "storyPoints",
                      e.target.value !== "" ? Number(e.target.value) : null,
                    );
                  }}
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
          </Box>

          <FormControl fullWidth>
            <InputLabel>Labels</InputLabel>
            <Select
              multiple
              name="labels"
              value={formik.values.labels || []}
              onChange={formik.handleChange}
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
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!formik.dirty || !formik.isValid}
        >
          Create Task
        </Button>
      </DialogActions>
    </form>
    </Dialog>
  );
}
