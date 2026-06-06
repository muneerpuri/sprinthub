"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Grid,
  Skeleton,
  TextField,
  InputAdornment,
  Pagination
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ProjectModal from "../../components/projects/ProjectModal";
import ProjectCard from "../../components/projects/ProjectCard";
import EmptyProjectState from "../../components/projects/EmptyProjectState";
import { useGetProjectsQuery, useAddProjectMutation } from "../../lib/apiSlice";

export default function ProjectsPage() {
  const router = useRouter();

  // Pagination and Search State
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const ITEMS_PER_PAGE = 9;

  // Debounce search input to prevent API spam
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to page 1 on new searches
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch paginated and searched data from API
  const { data, isLoading, isFetching } = useGetProjectsQuery({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch
  });

  const projects = data?.projects || [];
  const totalPages = data?.totalPages || 0;

  const [addProject] = useAddProjectMutation();
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenDetails = (projectId) => {
    router.push(`/projects/${projectId}`);
  };

  const handleOpenNew = () => {
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    try {
      await addProject(values).unwrap();
      toast.success("Project created!");
      setModalOpen(false);
      // Optional: reset to page 1 after adding to see the new project
      setPage(1);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving.");
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <DashboardLayout>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Projects</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your workspaces and initiatives
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "center" }}>
          <TextField
            placeholder="Search projects..."
            variant="outlined"
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            
            // InputProps={{
            //   startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            // }}
            sx={{ width: { xs: "100%", sm: "250px", md: "300px" } }}
          />
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenNew} sx={{ width: { xs: "100%", sm: "auto" }, whiteSpace: "nowrap" }}>
            New Project
          </Button>
        </Box>
      </Box>

      {/* Show skeletons on initial load OR while fetching new pages/searches */}
      {isLoading || isFetching ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item="true" size={{ xs: 12, sm: 6, md: 4 }} key={n}>
              <Skeleton variant="rounded" height={150} />
            </Grid>
          ))}
        </Grid>
      ) : projects.length === 0 && !debouncedSearch ? (
        <EmptyProjectState onAction={handleOpenNew} />
      ) : projects.length === 0 && debouncedSearch ? (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No projects found matching "{debouncedSearch}"
          </Typography>
          <Button sx={{ mt: 2 }} onClick={() => setSearchInput("")}>Clear Search</Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item="true" size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                <ProjectCard project={project} onClick={() => handleOpenDetails(project.id)} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        isEditing={false}
      />
    </DashboardLayout>
  );
}