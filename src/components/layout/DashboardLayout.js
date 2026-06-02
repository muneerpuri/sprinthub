// src/components/layout/DashboardLayout.js
"use client";
import React, { useState, useContext } from "react";
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemIcon, ListItemText, IconButton, Avatar, useTheme, ListItemButton
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

const drawerWidth = 260;

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const menuItems = [
    { title: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { title: "Projects", icon: <FolderIcon />, path: "/projects" },
    { title: "Tasks", icon: <AssignmentIcon />, path: "/tasks" },
  ];

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ my: 1 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: "primary.main", mr: 1.5 }} />
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
          <Avatar sx={{ width: 35, height: 35, bgcolor: "primary.main", fontSize: 14 }}>U</Avatar>
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