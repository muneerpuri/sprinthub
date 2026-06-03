"use client";
import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { supabase } from "../../utils/supabase";
import { useRouter } from "next/navigation";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

/**
 * AuthPage component handles user authentication, including login and signup.
 * It provides a form for users to enter their credentials and interacts with Supabase for authentication.
 *
 * @returns {JSX.Element} The authentication page with login/signup forms.
 */
export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const checkLoggedUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/tasks");
      }
    };
    checkLoggedUser();
  }, [router]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Login Flow
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              firstName: formData.firstName,
              lastName: formData.lastName,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created! You can now log in.");
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Left Branding Side - Hidden on Mobile */}
      <Grid
        item="true"
        size={{ xs: 12, md: 6 }}
        sx={{
          background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          p: 6,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Manage tasks flawlessly.
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, maxWidth: 400 }}>
            Join thousands of users organizing their workflow, tracking
            projects, and collaborating with ease.
          </Typography>
        </motion.div>
      </Grid>

      {/* Right Form Side */}
      <Grid
        item="true"
        size={{ xs: 12, md: 6 }}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 5,
              width: "100%",
              maxWidth: 450,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
              {isLogin ? "Welcome back" : "Create an account"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              {isLogin
                ? "Enter your details to access your dashboard."
                : "Start organizing your life in seconds."}
            </Typography>

            <form onSubmit={handleAuth}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {!isLogin && (
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      onChange={handleChange}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      onChange={handleChange}
                      required
                    />
                  </Box>
                )}
                <TextField
                  fullWidth
                  label="Email address"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  onChange={handleChange}
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 2, py: 1.5, fontSize: "1rem" }}
                >
                  {isLogin ? "Sign In" : "Sign Up"}
                </Button>
              </Box>
            </form>

            <Button
              fullWidth
              sx={{ mt: 3, color: "text.secondary" }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </Button>
          </Paper>
        </motion.div>
      </Grid>
    </Grid>
  );
}
