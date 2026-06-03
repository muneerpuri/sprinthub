// src/app/projects/page.js
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box, Typography, Button, Grid, Card, CardContent,
    Chip, Skeleton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { toast } from "react-toastify";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ProjectModal from "../../components/projects/ProjectModal";
import {
    useGetProjectsQuery,
    useAddProjectMutation
} from "../../lib/apiSlice";

export default function ProjectsPage() {
    const router = useRouter();
    const { data: projects = [], isLoading } = useGetProjectsQuery();
    const [addProject] = useAddProjectMutation();

    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "", color: "#3b82f6", isArchived: false });

    // Navigate to dedicated page
    const handleOpenDetails = (projectId) => {
        router.push(`/projects/${projectId}`);
    };

    const handleOpenNew = () => {
        setFormData({ name: "", description: "", color: "#3b82f6", isArchived: false });
        setModalOpen(true);
    };

    const handleSave = async () => {
        try {
            await addProject(formData).unwrap();
            toast.success("Project created!");
            setModalOpen(false);
        } catch (error) {
            console.error("Save error:", error); 
            toast.error("An error occurred while saving.");
        }
    };

    return (
        <DashboardLayout>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Projects</Typography>
                    <Typography variant="body2" color="text.secondary">Manage your workspaces and initiatives</Typography>
                </Box>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenNew}>
                    New Project
                </Button>
            </Box>

            {isLoading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3].map((n) => (
                        <Grid item="true" size={{ xs: 12, sm: 6, md: 4 }} key={n}>
                            <Skeleton variant="rounded" height={150} />
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
                                onClick={() => handleOpenDetails(project.id)}
                                variant="outlined"
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease-in-out",
                                    '&:hover': {
                                        borderColor: project.color || 'primary.main',
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                                        transform: "translateY(-2px)"
                                    }
                                }}
                            >
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

                                <Box sx={{ px: 2, pb: 2 }}>
                                    <Typography variant="caption" color="text.disabled">
                                        Created: {new Date(project.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <ProjectModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                form={formData}
                setForm={setFormData}
                onSave={handleSave}
                isEditing={false}
            />
        </DashboardLayout>
    );
}