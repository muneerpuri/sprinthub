"use client";
import React, { useState } from "react";
import { Box, Typography, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useGetWorkspacesQuery, useDeleteWorkspaceMutation, useAddWorkspaceMutation, apiSlice } from "../../lib/apiSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";

export default function WorkspacesPage() {
  const dispatch = useDispatch();
    const [deleteWorkspace] = useDeleteWorkspaceMutation();
  const { data: workspaces = [], isLoading } = useGetWorkspacesQuery();
  const [addWorkspace, { isLoading: isAdding }] = useAddWorkspaceMutation();
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await addWorkspace({ name: name.trim() }).unwrap();
      toast.success("Workspace created!");
      setOpen(false);
      setName("");
    } catch (err) {
      toast.error("Failed to create workspace.");
    }
  };
const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this workspace?")) {
      try {
        await deleteWorkspace(id).unwrap();
        dispatch(
          apiSlice.util.updateQueryData("getWorkspaces", undefined, (draft) => {
            const index = draft.findIndex((ws) => ws.id === id);
            if (index !== -1) draft.splice(index, 1);
          }),
        );
        dispatch(apiSlice.util.invalidateTags(["Workspace"]));
        toast.success("Workspace deleted!");
      } catch (err) {
        const message = err?.data?.message || err?.message || "Failed to delete workspace.";
        toast.error(message);
      }
    }
  };
  return (
    <DashboardLayout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Workspaces</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your organizations and teams
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          New Workspace
        </Button>
      </Box>

      {isLoading ? (
        <Typography>Loading workspaces...</Typography>
      ) : (
        <Grid container spacing={3}>
          {workspaces.map((ws, index) => (
            <Grid item="true" key={`${ws?.id}-${index}`} size={{
                xs: 12,
                sm: 6,
                md: 4
            }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
               <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "space-between" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar sx={{ bgcolor: "primary.main" }}><BusinessIcon /></Avatar>
      <Box>
        <Typography variant="h6" fontWeight="bold">{ws.name}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
          Role: {ws.role}
        </Typography>
      </Box>
    </Box>
    {/* ADD DELETE BUTTON HERE */}
    {ws.role === 'owner' && (
      <IconButton color="error" onClick={() => handleDelete(ws.id)}>
        <DeleteIcon />
      </IconButton>
    )}
  </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* CREATE MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold">Create Workspace</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Workspace Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!name.trim() || isAdding}>
            {isAdding ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}