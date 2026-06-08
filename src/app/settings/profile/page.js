"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Alert } from "@mui/material";
import { toast } from "react-toastify";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { useGetCurrentUserQuery, useUpdateUserProfileMutation } from "../../../lib/apiSlice";
import { supabase } from "../../../utils/supabase";

export default function ProfileSettingsPage() {
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [pendingEmail, setPendingEmail] = useState(null); 

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "", password: "" });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ id: user.id, firstName: form.firstName, lastName: form.lastName }).unwrap();

      const authUpdates = {};
      const emailChanged = form.email !== user.email;
      if (emailChanged) authUpdates.email = form.email;
      if (form.password) authUpdates.password = form.password;

      if (Object.keys(authUpdates).length > 0) {
        const options = emailChanged
          ? { emailRedirectTo: `${window.location.origin}/auth/callback` }
          : undefined;
        const { error: authError } = await supabase.auth.updateUser(authUpdates, options);
        if (authError) throw authError;

        if (emailChanged) {
          setPendingEmail(form.email);
          toast.info(
            `A verification link has been sent to ${form.email}. Please check your inbox and click the link to confirm your new email.`,
            { autoClose: 10000 },
          );
        }
        if (form.password) {
          toast.success("Password updated successfully!");
        }
      } else {
        toast.success("Profile updated successfully!");
      }

      setForm((prev) => ({ ...prev, password: "" })); 
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };
  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" mb={3}>Account Settings</Typography>
        {isLoading ? <Typography>Loading...</Typography> : (
          <Paper variant="outlined" sx={{ p: 4 }}>
            {pendingEmail && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Email change pending — verification link sent to <strong>{pendingEmail}</strong>.
                Please check your inbox and click the link to confirm.
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <Box display="flex" gap={2} mb={3}>
                <TextField fullWidth label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
                <TextField fullWidth label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
              </Box>
              <TextField fullWidth label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} mb={3} sx={{ mb: 3 }} required />
              <Typography variant="body2" color="text.secondary" mb={1}>Leave blank to keep current password</Typography>
              <TextField fullWidth label="New Password" name="password" type="password" value={form.password} onChange={handleChange} sx={{ mb: 4 }} />
              
              <Button type="submit" variant="contained" color="primary" disabled={isUpdating} size="large" fullWidth>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
}