"use client";
import React, { useState, useContext } from "react";
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemIcon, ListItemText, IconButton, Avatar, useTheme, ListItemButton,
  Menu, MenuItem
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

const drawerWidth = 260;

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
          .from('users')
          .select('id, firstName, lastName, email')
          .eq('id', userId)
          .single();

        if (!error && data) {
          setUserData(data);
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

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
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? "primary.main" : "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title} 
                  sx={{fontWeight: isActive ? 600 : 400}}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <List sx={{ px: 2, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon color="error" /></ListItemIcon>
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
          color: "text.primary" 
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          
          {/* THEME TOGGLE BUTTON */}
          <IconButton onClick={colorMode.toggleColorMode} color="inherit" sx={{ mr: 2 }}>
            {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* USER AVATAR WITH MENU */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={handleAvatarClick}>
            <Avatar 
              sx={{ 
                width: 35, 
                height: 35, 
                bgcolor: "primary.main", 
                fontSize: 14,
                fontWeight: "bold"
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
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled sx={{ flexDirection: "column", alignItems: "flex-start", py: 1.5 }}>
              <Typography variant="body2" fontWeight="600">
                {userData ? `${userData.firstName} ${userData.lastName}` : "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userData?.email || ""}
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: drawerWidth, borderRight: "none" } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: drawerWidth, borderRight: 1, borderColor: "divider" } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8, bgcolor: "background.default", overflow: "auto" }}>
        {children}
      </Box>
    </Box>
  );
}
