"use client";
import React, { useState } from "react";
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
  Typography,
  Paper,
  Chip,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {
  useGetProjectsListQuery,
  useGetCommentsQuery,
  useAddCommentMutation,
  useGetLabelsQuery,
  useAddLabelMutation,
  useGetWorkspacesQuery,
  useGetColumnsQuery,
} from "../../lib/apiSlice";
import { useGetProjectMembersQuery } from "../../lib/apiSlice";

export default function TaskDetailModal({
  activeTask,
  setActiveTask,
  onClose,
  onSave,
  onDelete,
}) {
  const { data: projects = [] } = useGetProjectsListQuery();
  const { data: comments = [] } = useGetCommentsQuery(activeTask?.id, { skip: !activeTask });
  const { data: members = [] } = useGetProjectMembersQuery(activeTask?.projectId, { skip: !activeTask?.projectId });
  // Custom Columns & Workspace setup
  const { data: columns = [] } = useGetColumnsQuery(activeTask?.projectId, { skip: !activeTask?.projectId });
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const activeWorkspace = workspaces[0]?.id; // Defaulting to the user's primary workspace

  // Custom Labels setup
  const { data: labelsData = [] } = useGetLabelsQuery(activeWorkspace, { skip: !activeWorkspace });
  const [addLabel] = useAddLabelMutation();
  const [addComment] = useAddCommentMutation();
  const [newComment, setNewComment] = useState("");

  if (!activeTask) return null;

  const handleChange = (e) => {
    const value =
      e.target.name === "storyPoints"
        ? e.target.value ? Number(e.target.value) : null
        : e.target.value;

        console.log(e.target.name,value)

    setActiveTask({ ...activeTask, [e.target.name]: value });
  };

  const handleDateChange = (newValue) => {
    setActiveTask({ ...activeTask, dueDate: newValue ? newValue.toISOString() : null });
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    await addComment({ taskId: activeTask.id, comment: newComment });
    setNewComment("");
  };

  // Handle dynamic labels creation and selection
  const handleLabelChange = async (event, newValue) => {
    const processedLabels = await Promise.all(
      newValue.map(async (val) => {
        if (typeof val === "string") {
          // User typed a new label, let's create it in the database
          const res = await addLabel({ name: val, workspaceId: activeWorkspace }).unwrap();
          return res[0].name;
        }
        return val.name || val;
      })
    );
    setActiveTask({ ...activeTask, labels: processedLabels });
  };

  return (
    <Dialog open={Boolean(activeTask)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle fontWeight="bold">Task Details</DialogTitle>

      <DialogContent dividers sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, p: 3 }}>
        {/* LEFT: FORM DATA */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Title"
            name="title"
            value={activeTask.title || ""}
            onChange={handleChange}
            fullWidth
          />

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Autocomplete
                options={projects}
                getOptionLabel={(option) => option.name || ""}
                value={projects.find((p) => p.id === activeTask.projectId) || null}
                onChange={(_, newValue) => {
                  setActiveTask({ ...activeTask, projectId: newValue?.id || "", columnId: "" }); // reset column when project changes
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => <TextField {...params} label="Project" placeholder="Search projects..." />}
                fullWidth
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Due Date"
                  value={activeTask.dueDate ? dayjs(activeTask.dueDate) : null}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          <TextField
            label="Description"
            name="description"
            value={activeTask.description || ""}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              {/* DYNAMIC COLUMNS (Replaces hardcoded Status) */}
              <FormControl fullWidth disabled={!activeTask.projectId}>
                <InputLabel>Column / Status</InputLabel>
                <Select
                  name="columnId"
                  value={activeTask.columnId || ""}
                  label="Column / Status"
                  onChange={handleChange}
                >
                  {columns.map((col) => (
                    <MenuItem key={col.id} value={col.id}>
                      {col.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select name="priority" value={activeTask.priority || "medium"} label="Priority" onChange={handleChange}>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select
                  name="assigneeId"
                  value={activeTask.assigneeId || ""}
                  label="Assignee"
                  onChange={handleChange}
                >
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

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Story Points</InputLabel>
                <Select name="storyPoints" value={activeTask.storyPoints || ""} label="Story Points" onChange={handleChange}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={8}>8</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1 }}>
              {/* DYNAMIC LABELS WITH AUTOCOMPLETE */}
              <Autocomplete
                multiple
                freeSolo
                options={labelsData.map((option) => option.name)}
                value={activeTask.labels || []}
                onChange={handleLabelChange}
                renderOption={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Labels" placeholder="Type and press enter" />
                )}
                fullWidth
              />
            </Box>
          </Box>
        </Box>

        {/* RIGHT: COMMENTS SECTION */}
        <Box sx={{ width: { xs: "100%", md: "350px" }, display: "flex", flexDirection: "column" }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Activity & Comments
          </Typography>

          <Paper variant="outlined" sx={{ flexGrow: 1, mb: 2, p: 2, maxHeight: "300px", overflowY: "auto", bgcolor: "background.default" }}>
            {comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                No comments yet.
              </Typography>
            ) : (
              comments.map((c) => (
                <Box key={c.id} sx={{ mb: 2 }}>
                  <Typography variant="caption" color="primary" fontWeight="bold">
                    {c.owner ? `${c.owner.firstName} ${c.owner.lastName}` : "User"}
                  </Typography>
                  {c.owner?.email && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      ({c.owner.email})
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, p: 1, bgcolor: "background.paper", borderRadius: 1, border: 1, borderColor: "divider" }}>
                    {c.comment}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              size="small"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              fullWidth
              multiline
              maxRows={3}
            />
            <Button variant="contained" onClick={handlePostComment} disabled={!newComment.trim()}>
              Post
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, flexDirection: { xs: "column-reverse", sm: "row" }, gap: { xs: 1.5, sm: 0 }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}>
        <Button onClick={() => onDelete(activeTask)} color="error" fullWidth sx={{ width: { sm: "auto" } }}>
          Delete Task
        </Button>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, width: { xs: "100%", sm: "auto" } }}>
          <Button onClick={onClose} color="inherit" fullWidth sx={{ mr: { sm: 1 } }}>
            Cancel
          </Button>
          <Button onClick={onSave} variant="contained" color="primary" fullWidth>
            Save Changes
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}