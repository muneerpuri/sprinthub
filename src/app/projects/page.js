"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, Grid, Skeleton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ProjectModal from "../../components/projects/ProjectModal";
import ProjectCard from "../../components/projects/ProjectCard";
import EmptyProjectState from "../../components/projects/EmptyProjectState";
import { useGetProjectsQuery, useAddProjectMutation } from "../../lib/apiSlice";

/**
 * Manages and displays the list of projects, handling creation and navigation.
 *
 * @returns {JSX.Element}
 */
export default function ProjectsPage() {
  const router = useRouter();
  const { data: projects = [], isLoading } = useGetProjectsQuery();
  const [addProject] = useAddProjectMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    isArchived: false,
  });

  const handleOpenDetails = (projectId) => {
    router.push(`/projects/${projectId}`);
  };

  const handleOpenNew = () => {
    setFormData({
      name: "",
      description: "",
      color: "#3b82f6",
      isArchived: false,
    });
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your workspaces and initiatives
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenNew}
        >
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
        <EmptyProjectState onAction={handleOpenNew} />
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item="true" size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
              <ProjectCard
                project={project}
                onClick={() => handleOpenDetails(project.id)}
              />
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
