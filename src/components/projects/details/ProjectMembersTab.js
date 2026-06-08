import React, { useState } from "react";
import {
  Box, Typography, MenuItem, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Select, IconButton,
  CircularProgress, FormControl, InputLabel
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ProjectMembersTab({
  members,
  workspaceMembers = [],
  isLoading,
  canManage,
  ownerId,
  onInvite,
  onRoleChange,
  onRemove,
  isInviting,
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  // Filter out users who are already in the project
  const availableWorkspaceMembers = workspaceMembers.filter(
    (wm) => !members.some((m) => m.userId === wm.userId)
  );

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    // Find the email of the selected user to pass to your existing onInvite function
    const userToInvite = availableWorkspaceMembers.find(wm => wm.userId === selectedUserId);
    if (userToInvite) {
      await onInvite(userToInvite.users.email, inviteRole);
      setSelectedUserId("");
      setInviteRole("viewer");
    }
  };

  return (
    <Box>
      {canManage && (
        <Paper sx={{ p: 3, mb: 4 }} variant="outlined">
          <Typography variant="h6" mb={2}>
            Assign Workspace Member to Project
          </Typography>
          <Box
            component="form"
            onSubmit={handleAssignSubmit}
            sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: { xs: "stretch", sm: "center" } }}
          >
            <FormControl size="small" fullWidth sx={{ flex: 1 }}>
              <InputLabel>Select Workspace Member</InputLabel>
              <Select
                value={selectedUserId}
                label="Select Workspace Member"
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
              >
                {availableWorkspaceMembers.length === 0 ? (
                  <MenuItem disabled value=""><em>All workspace members are in this project</em></MenuItem>
                ) : (
                  availableWorkspaceMembers.map((wm) => (
                    <MenuItem key={wm.userId} value={wm.userId}>
                      {wm.users?.firstName} {wm.users?.lastName} ({wm.users?.email})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Select size="small" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="viewer">Viewer</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="owner">Owner</MenuItem>
            </Select>

            <Button
              type="submit" variant="contained" startIcon={<PersonAddIcon />}
              disabled={isInviting || !selectedUserId} sx={{ minWidth: 140 }}
            >
              {isInviting ? "Assigning..." : "Assign to Project"}
            </Button>
          </Box>
        </Paper>
      )}

      <Typography variant="h6" mb={2}>Project Members</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              {canManage && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : members.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No members assigned yet.</TableCell></TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.users?.firstName} {member.users?.lastName}</TableCell>
                  <TableCell>{member.users?.email}</TableCell>
                  {member?.userId === ownerId ? (
                    <TableCell>OWNER</TableCell>
                  ) : !canManage ? (
                    <TableCell>{member?.role?.toUpperCase() || "NA"}</TableCell>
                  ) : (
                    <TableCell>
                      <Select size="small" value={member.role} onChange={(e) => onRoleChange(member.id, e.target.value)} sx={{ minWidth: 120 }}>
                        <MenuItem value="viewer">Viewer</MenuItem>
                        <MenuItem value="editor">Editor</MenuItem>
                        <MenuItem value="owner">Owner</MenuItem>
                      </Select>
                    </TableCell>
                  )}
                  {canManage && (
                    <TableCell align="right">
                      <IconButton color="error" disabled={member?.userId === ownerId} onClick={() => onRemove(member.id)}>
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
  );
}