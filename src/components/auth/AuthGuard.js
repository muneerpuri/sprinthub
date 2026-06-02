"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { Box, CircularProgress } from "@mui/material";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      if (!session && pathname !== "/auth") {
        router.push("/auth");
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && pathname !== "/auth") {
        router.push("/auth");
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [router, pathname]);

   if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }


  // If on auth page, just render it. Otherwise, only render children if authenticated.
  if (!session && pathname !== "/auth") return null;

  return children;
}