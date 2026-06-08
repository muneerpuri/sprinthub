"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { Box, CircularProgress } from "@mui/material";

/**
 * @typedef {Object} AuthGuardProps
 * @property {React.ReactNode} children - The children to be rendered if the user is authenticated or on the auth page.
 */

/**
 * AuthGuard component that protects routes by checking user authentication status.
 * If the user is not authenticated and not on the '/auth' page, they are redirected to '/auth'.
 * Displays a loading spinner while checking the session.
 *
 * @param {AuthGuardProps} props - The component props.
 * @returns {JSX.Element|null} The children if authenticated or on the auth page, a loading spinner, or null.
 */
export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      if (!session && pathname !== "/auth" && pathname !== "/auth/callback") {
        router.push("/auth");
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session && pathname !== "/auth" && pathname !== "/auth/callback") {
          router.push("/auth");
        }
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!session && pathname !== "/auth" && pathname !== "/auth/callback") return null;

  return children;
}
