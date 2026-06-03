import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  IconButton,
  CircularProgress,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * @typedef {Object} ProjectMembersTabProps
 * @property {Array} members - Array of project members.
 * @property {boolean} isLoading - Loading state for members.
 * @property {boolean} canManage - Whether the current user can manage members.
 * @property {string} ownerId - The ID of the project owner.
 * @property {Function} onInvite - Handler to invite a user.
 * @property {Function} onRoleChange - Handler to change a member's role.
 * @property {Function} onRemove - Handler to remove a member.
 * @property {boolean} isInviting - Loading state for the invite action.
 */

/**
 * Displays project members and handles user invitations.
 *
 * @param {ProjectMembersTabProps} props - The component props.
 * @returns {JSX.Element}
 */
export default function ProjectMembersTab({
  members,
  isLoading,
  canManage,
  ownerId,
  onInvite,
  onRoleChange,
  onRemove,
  isInviting,
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    await onInvite(inviteEmail, inviteRole);
    setInviteEmail("");
    setInviteRole("viewer");
  };

  return (
    <Box>
      {canManage && (
        <Paper sx={{ p: 3, mb: 4 }} variant="outlined">
          <Typography variant="h6" mb={2}>
            Invite User to Project
          </Typography>
          <Box
            component="form"
            onSubmit={handleInviteSubmit}
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
              {canManage && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
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
                  {member?.userId === ownerId ? (
                    <TableCell>Owner</TableCell>
                  ) : (member?.userId !== ownerId ? <TableCell>
                    {member?.role || "NA"}
                  </TableCell> :
                    <TableCell>
                      {canManage ? (
                        <Select
                          size="small"
                          value={member.role}
                          onChange={(e) =>
                            onRoleChange(member.id, e.target.value)
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
                  {canManage && (
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        disabled={member?.userId === ownerId}
                        onClick={() => onRemove(member.id)}
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
  );
}
