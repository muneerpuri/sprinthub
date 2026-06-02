// src/app/projects/page.js
"use client";
import React, { useState } from "react";
import {
    Box, Typography, Button, Grid, Card, CardContent,
    CardActions, Chip, IconButton, Skeleton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { toast } from "react-toastify";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ProjectModal from "../../components/projects/ProjectModal";
import {
    useGetProjectsQuery,
    useAddProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation
} from "../../lib/apiSlice";

export default function ProjectsPage() {
    const { data: projects = [], isLoading } = useGetProjectsQuery();
    const [addProject] = useAddProjectMutation();
    const [updateProject] = useUpdateProjectMutation();
    const [deleteProject] = useDeleteProjectMutation();

    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "", color: "#3b82f6", isArchived: false });

    const handleOpenNew = () => {
        setFormData({ name: "", description: "", color: "#3b82f6", isArchived: false });
        setIsEditing(false);
        setModalOpen(true);
    };

    const handleOpenEdit = (project) => {
        setFormData(project);
        setIsEditing(true);
        setModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (isEditing) {
                await updateProject(formData).unwrap();
                toast.success("Project updated!");
            } else {
                await addProject(formData).unwrap();
                toast.success("Project created!");
            }
            setModalOpen(false);
        } catch (error) {
            toast.error("An error occurred.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this project? Tasks attached to it may be affected.")) {
            try {
                await deleteProject(id).unwrap();
                toast.success("Project deleted");
            } catch (error) {
                toast.error("Failed to delete project");
            }
        }
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Projects</Typography>
                    <Typography variant="body2" color="text.secondary">Manage your workspaces and initiatives</Typography>
                </Box>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenNew}>
                    New Project
                </Button>
            </Box>

            {/* Grid Content */}
            {isLoading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3].map((n) => (
                        <Grid item="true" size={{ xs: 12, sm: 6, md: 4 }} key={n}>
                            <Skeleton variant="rounded" height={180} />
                        </Grid>
                    ))}
                </Grid>
            ) : projects.length === 0 ? (
                <Box sx={{ textAlign: "center", mt: 10, p: 4, bgcolor: "background.paper", borderRadius: 2, border: "1px dashed", borderColor: "divider" }}>
                    <FolderOpenIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No projects found</Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>Create a project to start organizing your tasks.</Typography>
                    <Button variant="outlined" onClick={handleOpenNew}>Create your first project</Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {projects.map((project) => (
                        <Grid item="true" size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                            <Card
                                variant="outlined"
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    transition: "all 0.2s ease-in-out",
                                    '&:hover': {
                                        borderColor: project.color || 'primary.main',
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                                        transform: "translateY(-2px)"
                                    }
                                }}
                            >
                                {/* Top Color Banner */}
                                <Box sx={{ height: 6, width: "100%", bgcolor: project.color || "#3b82f6" }} />

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                        <Typography variant="h6" fontWeight="bold" noWrap title={project.name}>
                                            {project.name}
                                        </Typography>
                                        {project.isArchived && (
                                            <Chip label="Archived" size="small" color="default" variant="outlined" />
                                        )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {project.description || "No description provided."}
                                    </Typography>
                                </CardContent>

                                <Box sx={{ px: 2, pb: 1 }}>
                                    <Typography variant="caption" color="text.disabled">
                                        Created: {new Date(project.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>

                                <CardActions sx={{ justifyContent: "flex-end", borderTop: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
                                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(project)} title="Edit Project">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(project.id)} title="Delete Project">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Reusable Modal Component */}
            <ProjectModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                form={formData}
                setForm={setFormData}
                onSave={handleSave}
                isEditing={isEditing}
            />
        </DashboardLayout>
    );
}