"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";

import DashboardLayout from "../../../components/layout/DashboardLayout";
import ProjectModal from "../../../components/projects/ProjectModal";
import ProjectHeader from "../../../components/projects/details/ProjectHeader";
import ProjectTasksTab from "../../../components/projects/details/ProjectTasksTab";
import ProjectMembersTab from "../../../components/projects/details/ProjectMembersTab";

import {
  useGetProjectByIdQuery,
  useGetProjectMembersQuery,
  useInviteUserToProjectMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetCurrentUserQuery,
  useGetTasksQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "../../../lib/apiSlice";

/**
 * Main wrapper page for project details. Combines project header, tasks, and members tabs.
 *
 * @returns {JSX.Element}
 */
export default function ProjectDetailsPage() {
  const { id: projectId } = useParams();
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    isArchived: false,
  });

  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: project, isLoading: isProjectLoading } =
    useGetProjectByIdQuery(projectId);
  const { data: members = [], isLoading: isMembersLoading } =
    useGetProjectMembersQuery(projectId);
  const { data: allTasks = [], isLoading: tasksLoading } = useGetTasksQuery();

  const [inviteUser, { isLoading: isInviting }] =
    useInviteUserToProjectMutation();
  const [updateRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const isProjectOwner = project?.ownerId === currentUser;
  const memberRecord = members.find((m) => m.userId === currentUser);
  const userRole = isProjectOwner ? "owner" : memberRecord?.role || "viewer";

  const canManageMembers = userRole === "owner";
  const canEditProject = userRole === "owner" || userRole === "editor";
  const canDeleteProject = userRole === "owner";

  const projectTasks = allTasks.filter((t) => t.projectId === projectId);

  const handleOpenEdit = () => {
    setFormData({
      id: project?.id,
      name: project?.name || "",
      description: project?.description || "",
      color: project?.color || "#3b82f6",
      isArchived: project?.isArchived || false,
    });
    setModalOpen(true);
  };

  const handleSaveProject = async () => {
    try {
      await updateProject(formData).unwrap();
      toast.success("Project updated!");
      setModalOpen(false);
    } catch (error) {
      toast.error("Failed to update project.");
    }
  };

  const handleDeleteProject = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this project entirely? This cannot be undone.",
      )
    ) {
      try {
        await deleteProject(projectId).unwrap();
        toast.success("Project deleted");
        router.push("/projects");
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  const handleInvite = async (email, role) => {
    try {
      await inviteUser({ projectId, email, role }).unwrap();
      toast.success("User invited successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to invite user");
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateRole({ memberId, role: newRole }).unwrap();
      toast.success("Role updated");
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this user from the project?")) return;
    try {
      await removeMember(memberId).unwrap();
      toast.success("User removed");
    } catch (err) {
      toast.error("Failed to remove user");
    }
  };

  if (isProjectLoading) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <Typography>Project not found.</Typography>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/projects")}
        sx={{ mb: 2 }}
      >
        Back to Projects
      </Button>

      <ProjectHeader
        project={project}
        canEdit={canEditProject}
        canDelete={canDeleteProject}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteProject}
      />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)}>
          <Tab label="Tasks" />
          <Tab label="Members & Invites" />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <ProjectTasksTab
          tasks={projectTasks}
          isLoading={tasksLoading}
          projectColor={project?.color}
        />
      )}

      {currentTab === 1 && (
        <ProjectMembersTab
          members={members}
          isLoading={isMembersLoading}
          canManage={canManageMembers}
          ownerId={project?.ownerId}
          onInvite={handleInvite}
          onRoleChange={handleRoleChange}
          onRemove={handleRemoveMember}
          isInviting={isInviting}
        />
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={formData}
        setForm={setFormData}
        onSave={handleSaveProject}
        isEditing={true}
      />
    </DashboardLayout>
  );
}
