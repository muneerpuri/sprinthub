// src/components/tasks/TaskDetailModal.js
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
  OutlinedInput, 
  Chip 
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useGetProjectsQuery, useGetCommentsQuery, useAddCommentMutation } from "../../lib/apiSlice";

const AVAILABLE_LABELS = ["Bug", "Feature", "Enhancement", "Documentation", "Design"];

export default function TaskDetailModal({ activeTask, setActiveTask, onClose, onSave, onDelete }) {
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: comments = [] } = useGetCommentsQuery(activeTask?.id, { skip: !activeTask });
  const [addComment] = useAddCommentMutation();
  const [newComment, setNewComment] = useState("");

  if (!activeTask) return null;

  const handleChange = (e) => {
    const value = e.target.name === "storyPoints" 
      ? (e.target.value ? Number(e.target.value) : null) 
      : e.target.value;

    setActiveTask({ ...activeTask, [e.target.name]: value });
  };

  const handleDateChange = (newValue) => {
    setActiveTask({ 
      ...activeTask, 
      dueDate: newValue ? newValue.toISOString() : null 
    });
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    await addComment({ taskId: activeTask.id, comment: newComment });
    setNewComment("");
  };

  return (
    <Dialog open={Boolean(activeTask)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle fontWeight="bold">Task Details</DialogTitle>
      
      <DialogContent dividers sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, p: 3 }}>
        
        {/* LEFT: FORM DATA */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Title" name="title" value={activeTask.title || ""} onChange={handleChange} fullWidth />
          
          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select name="projectId" value={activeTask.projectId || ""} label="Project" onChange={handleChange}>
                <MenuItem value=""><em>None</em></MenuItem>
                {projects.map(proj => (
                  <MenuItem key={proj.id} value={proj.id}>{proj.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Due Date"
                value={activeTask.dueDate ? dayjs(activeTask.dueDate) : null}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>

          <TextField label="Description" name="description" value={activeTask.description || ""} onChange={handleChange} fullWidth multiline rows={4} />
          
          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={activeTask.status || "PENDING"} label="Status" onChange={handleChange}>
                <MenuItem value="PENDING">To Do</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Done</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select name="priority" value={activeTask.priority || "medium"} label="Priority" onChange={handleChange}>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Story Points</InputLabel>
              <Select 
                name="storyPoints" 
                value={activeTask.storyPoints || ""} 
                label="Story Points" 
                onChange={handleChange}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={8}>8</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Labels</InputLabel>
              <Select
                multiple
                name="labels"
                value={activeTask.labels || []}
                onChange={handleChange}
                input={<OutlinedInput label="Labels" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => <Chip key={value} label={value} size="small" />)}
                  </Box>
                )}
              >
                {AVAILABLE_LABELS.map((name) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* RIGHT: COMMENTS SECTION */}
        <Box sx={{ width: { xs: '100%', md: '350px' }, display: "flex", flexDirection: "column" }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Activity & Comments</Typography>
          
          <Paper variant="outlined" sx={{ flexGrow: 1, mb: 2, p: 2, maxHeight: '300px', overflowY: 'auto', bgcolor: 'background.default' }}>
            {comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>No comments yet.</Typography>
            ) : (
              comments.map((c) => (
                <Box key={c.id} sx={{ mb: 2 }}>
                  <Typography variant="caption" color="primary" fontWeight="bold">User</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                    {c.comment}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField size="small" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} fullWidth multiline maxRows={3} />
            <Button variant="contained" onClick={handlePostComment} disabled={!newComment.trim()}>Post</Button>
          </Box>
        </Box>

      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button onClick={() => onDelete(activeTask)} color="error">Delete Task</Button>
        <Box>
          <Button onClick={onClose} color="inherit" sx={{ mr: 1 }}>Cancel</Button>
          <Button onClick={onSave} variant="contained" color="primary">Save Changes</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}