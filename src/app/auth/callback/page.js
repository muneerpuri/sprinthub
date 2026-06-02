"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabase";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // The Supabase client automatically picks up the ?code= or #access_token= from the URL
    // and establishes the session. We just need to wait for it and redirect.
    const handleEmailVerify = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth error:", error);
        router.push("/auth");
        return;
      }

      if (session) {
        router.push("/tasks");
      } else {
        // Fallback just in case it takes a second
        setTimeout(() => router.push("/tasks"), 2000);
      }
    };

    handleEmailVerify();
  }, [router]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", alignItems: "center", justifyContent: "center", bgcolor: "#fafafa" }}>
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6" color="text.secondary">
        Verifying your email...
      </Typography>
    </Box>
  );
}