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
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";

import { toast } from "react-toastify";

import DashboardLayout from "../../../components/layout/DashboardLayout";
import ProjectModal from "../../../components/projects/ProjectModal";
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
 * ProjectDetailsPage component displays the details of a specific project, including its tasks and members.
 * It allows for editing project details, managing members, and viewing project tasks.
 *
 * @returns {JSX.Element} The ProjectDetailsPage component.
 */
export default function ProjectDetailsPage() {
  const { id: projectId } = useParams();
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState(0);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  // Modal state for editing project
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    isArchived: false,
  });

  // Data Queries
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: project, isLoading: isProjectLoading } =
    useGetProjectByIdQuery(projectId);
  const { data: members = [], isLoading: isMembersLoading } =
    useGetProjectMembersQuery(projectId);
  const { data: allTasks = [], isLoading: tasksLoading } = useGetTasksQuery();

  // Mutations
  const [inviteUser, { isLoading: isInviting }] =
    useInviteUserToProjectMutation();
  const [updateRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  // Role-based Access Logic
  const isProjectOwner = project?.ownerId === currentUser;
  const memberRecord = members.find((m) => m.userId === currentUser);
  const userRole = isProjectOwner ? "owner" : memberRecord?.role || "viewer";

  // Feature Permissions based on roles
  const canManageMembers = userRole === "owner" || userRole === "editor";
  const canEditProject = userRole === "owner" || userRole === "editor";
  const canDeleteProject = userRole === "owner";

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

  const projectTasks = allTasks.filter((t) => t.projectId === projectId);
  const groupedTasks = {
    PENDING: projectTasks.filter(
      (t) => (t.status || "PENDING").toUpperCase() === "PENDING",
    ),
    IN_PROGRESS: projectTasks.filter(
      (t) => (t.status || "").toUpperCase() === "IN_PROGRESS",
    ),
    COMPLETED: projectTasks.filter(
      (t) => (t.status || "").toUpperCase() === "COMPLETED",
    ),
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const totalTasks = projectTasks.length;
  const completedTasks = groupedTasks.COMPLETED.length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const ownerName = project?.owner
    ? `${project.owner.firstName || ""} ${project.owner.lastName || ""}`.trim()
    : "No Owner";
  const ownerEmail = project?.owner?.email || null;
  const ownerInitials = project?.owner
    ? `${project.owner.firstName?.[0] || ""}${project.owner.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      await inviteUser({
        projectId,
        email: inviteEmail,
        role: inviteRole,
      }).unwrap();
      toast.success("User invited successfully!");
      setInviteEmail("");
      setInviteRole("viewer");
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

  if (isProjectLoading)
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
  if (!project)
    return (
      <DashboardLayout>
        <Typography>Project not found.</Typography>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/projects")}
        sx={{ mb: 2 }}
      >
        Back to Projects
      </Button>

      <Box
        sx={{
          height: 8,
          width: "100%",
          bgcolor: project?.color || "#3b82f6",
          borderRadius: "4px 4px 0 0",
          mb: 2,
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {project?.name || "Project"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
            <Chip
              label={project?.isArchived ? "Archived" : "Active"}
              color={project?.isArchived ? "default" : "primary"}
              variant="outlined"
              size="small"
            />
            <Typography variant="caption" color="text.disabled">
              Created:{" "}
              {project?.createdAt
                ? new Date(project.createdAt).toLocaleDateString()
                : ""}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {canEditProject && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleOpenEdit}
            >
              Edit
            </Button>
          )}
          {canDeleteProject && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteProject}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item="true" size={{ xs: 12, md: 7 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            fontWeight="bold"
          >
            Project Description
          </Typography>
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-line", color: "text.primary" }}
          >
            {project?.description || "No description provided."}
          </Typography>
        </Grid>

        <Grid item="true" size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              fontWeight="bold"
            >
              Project Owner
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}
            >
              <Avatar
                sx={{
                  bgcolor: project?.color || "primary.main",
                  width: 40,
                  height: 40,
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                {ownerInitials || <AccountCircleIcon />}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {ownerName}
                </Typography>
                {ownerEmail && (
                  <Typography variant="caption" color="text.secondary">
                    {ownerEmail}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)}>
          <Tab label="Tasks" />
          <Tab label="Members & Invites" />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AssignmentIcon color="action" />
              <Typography variant="subtitle1" fontWeight="bold">
                Tasks ({totalTasks})
              </Typography>
            </Box>
            {totalTasks > 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight="medium"
              >
                {completedTasks}/{totalTasks} Completed ({completionPercentage}
                %)
              </Typography>
            )}
          </Box>

          {totalTasks > 0 && (
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                mb: 3,
                height: 6,
                borderRadius: 3,
                bgcolor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  bgcolor: project?.color || "primary.main",
                },
              }}
            />
          )}

          {tasksLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : totalTasks === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "action.hover",
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No tasks created yet for this project.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {projectTasks.map((task) => {
                const formattedDate = task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : null;

                const statusColor =
                  (task.status || "PENDING").toUpperCase() === "COMPLETED"
                    ? "success"
                    : (task.status || "").toUpperCase() === "IN_PROGRESS"
                      ? "info"
                      : "default";

                const statusText =
                  (task.status || "PENDING").toUpperCase() === "COMPLETED"
                    ? "Done"
                    : (task.status || "").toUpperCase() === "IN_PROGRESS"
                      ? "In Progress"
                      : "To Do";

                return (
                  <Card
                    key={task.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 2,
                        "&:last-child": { pb: 2 },
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ minWidth: 200, flex: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{ lineBreak: "anywhere" }}
                        >
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              mt: 0.5,
                              lineBreak: "anywhere",
                            }}
                          >
                            {task.description}
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={statusText}
                          size="small"
                          color={statusColor}
                          variant="outlined"
                          sx={{
                            height: 22,
                            fontSize: "0.7rem",
                            fontWeight: "medium",
                          }}
                        />

                        {task.priority && (
                          <Chip
                            label={task.priority}
                            size="small"
                            color={getPriorityColor(task.priority)}
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                            }}
                          />
                        )}

                        {task.storyPoints && (
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {task.storyPoints} pt
                          </Typography>
                        )}

                        {formattedDate && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              color: "text.secondary",
                            }}
                          >
                            <CalendarTodayIcon sx={{ fontSize: 12 }} />
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {formattedDate}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {currentTab === 1 && (
        <Box>
          {canManageMembers && (
            <Paper sx={{ p: 3, mb: 4 }} variant="outlined">
              <Typography variant="h6" mb={2}>
                Invite User to Project
              </Typography>
              <Box
                component="form"
                onSubmit={handleInvite}
                sx={{ display: "flex", gap: 2, alignItems: "center" }}
              >
                <TextField
                  size="small"
                  label="User Email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  fullWidth
                />
                <Select
                  size="small"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="viewer">Viewer</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="owner">Owner</MenuItem>
                </Select>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  disabled={isInviting}
                  sx={{ minWidth: 120 }}
                >
                  {isInviting ? "Inviting..." : "Invite"}
                </Button>
              </Box>
            </Paper>
          )}

          <Typography variant="h6" mb={2}>
            Project Members
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  {canManageMembers && (
                    <TableCell align="right">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {isMembersLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No members invited yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.users?.firstName} {member.users?.lastName}
                      </TableCell>
                      <TableCell>{member.users?.email}</TableCell>
                      {member?.userId === project?.ownerId ? (
                        <TableCell>Owner</TableCell>
                      ) : (
                        <TableCell>
                          {canManageMembers ? (
                            <Select
                              size="small"
                              value={member.role}
                              onChange={(e) =>
                                handleRoleChange(member.id, e.target.value)
                              }
                              sx={{ minWidth: 120 }}
                            >
                              <MenuItem value="viewer">Viewer</MenuItem>
                              <MenuItem value="editor">Editor</MenuItem>
                              <MenuItem value="owner">Owner</MenuItem>
                            </Select>
                          ) : (
                            <Typography sx={{ textTransform: "capitalize" }}>
                              {member.role}
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      {canManageMembers && (
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            disabled={member?.userId === project?.ownerId}
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
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
