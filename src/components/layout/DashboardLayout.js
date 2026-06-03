"use client";
import React, { useState, useContext } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  useTheme,
  ListItemButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FolderIcon from "@mui/icons-material/Folder";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { supabase } from "../../utils/supabase";
import { useRouter, usePathname } from "next/navigation";
import { ColorModeContext } from "../../app/ThemeContextProvider";
import { useGetCurrentUserQuery, apiSlice } from "../../lib/apiSlice";
import { useDispatch } from "react-redux";
import ErrorBoundary from "../error/ErrorBoundary";
import ErrorFallbackUI from "../error/ErrorFallbackUI";

const drawerWidth = 260;

/**
 * @typedef {Object} DashboardLayoutProps
 * @property {React.ReactNode} children - The children to be rendered within the dashboard content area.
 */

/**
 * DashboardLayout component provides the main layout for the application dashboard.
 * It includes a navigation drawer, app bar, and handles user authentication status and theme toggling.
 *
 * @param {DashboardLayoutProps} props - The component props.
 * @returns {JSX.Element} The DashboardLayout component.
 */
export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const dispatch = useDispatch();

  // Fetch current user
  const { data: userId } = useGetCurrentUserQuery();

  // Fetch user details from Supabase
  const [userData, setUserData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, firstName, lastName, email")
          .eq("id", userId)
          .single();

        if (!error && data) {
          setUserData(data);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if (event.shiftKey) {
        const key = event.key.toLowerCase();
        if (key === "d") {
          event.preventDefault();
          router.push("/");
        } else if (key === "p") {
          event.preventDefault();
          router.push("/projects");
        } else if (key === "t") {
          event.preventDefault();
          router.push("/tasks");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(apiSlice.util.resetApiState());
    router.push("/auth");
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { title: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { title: "Projects", icon: <FolderIcon />, path: "/projects" },
    { title: "Tasks", icon: <AssignmentIcon />, path: "/tasks" },
  ];

  // Get initials for avatar
  const getInitials = () => {
    if (!userData) return "U";
    const first = userData.firstName?.[0] || "";
    const last = userData.lastName?.[0] || "";
    return (first + last).toUpperCase();
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ my: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: "primary.main",
            mr: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: "0.875rem",
          }}
        >
          SH
        </Box>
        <Typography variant="h6" fontWeight="800" letterSpacing="-0.5px">
          SprintHub
        </Typography>
      </Toolbar>

      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem disablePadding key={item.title} sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => router.push(item.path)}
                sx={{
                  borderRadius: 1.5,
                  ...(isActive && {
                    bgcolor: "action.selected",
                    fontWeight: "bold",
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "primary.main" : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={{ fontWeight: isActive ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box
        sx={{
          mx: 2.5,
          mb: 2,
          p: 2,
          bgcolor: "action.hover",
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          fontWeight="bold"
          color="text.secondary"
          sx={{
            display: "block",
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Keyboard Shortcuts
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            { keys: "Shift + D", label: "Dashboard" },
            { keys: "Shift + P", label: "Projects" },
            { keys: "Shift + T", label: "Tasks" },
          ].map((shortcut) => (
            <Box
              key={shortcut.keys}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.75rem"
              >
                {shortcut.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: "background.paper",
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  fontSize: "0.675rem",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "text.primary",
                }}
              >
                {shortcut.keys}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <List sx={{ px: 2, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" color="error" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />

          {/* THEME TOGGLE BUTTON */}
          <IconButton
            onClick={colorMode.toggleColorMode}
            color="inherit"
            sx={{ mr: 2 }}
          >
            {theme.palette.mode === "dark" ? (
              <LightModeIcon />
            ) : (
              <DarkModeIcon />
            )}
          </IconButton>

          {/* USER AVATAR WITH MENU */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={handleAvatarClick}
          >
            <Avatar
              sx={{
                width: 35,
                height: 35,
                bgcolor: "primary.main",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {getInitials()}
            </Avatar>
          </Box>

          {/* USER MENU */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              disabled
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                py: 1.5,
              }}
            >
              <Typography variant="body2" fontWeight="600">
                {userData
                  ? `${userData.firstName} ${userData.lastName}`
                  : "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userData?.email || ""}
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth, borderRight: "none" },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              borderRight: 1,
              borderColor: "divider",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          mt: 8,
          bgcolor: "background.default",
          overflow: "auto",
        }}
      >
        <ErrorBoundary FallbackComponent={ErrorFallbackUI}>
          {children}
        </ErrorBoundary>
      </Box>
    </Box>
  );
}
