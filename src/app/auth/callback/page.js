"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../utils/supabase";
import { Box, CircularProgress, Typography } from "@mui/material";

function VerifyEmailLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailVerify = async () => {
      // 1. Grab the TokenHash from the URL (your template named it 'code')
      const token_hash = searchParams.get("code");

      if (token_hash) {
        // 2. Explicitly verify the token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "signup", // 'signup' is the required type for email confirmation
        });

        if (error) {
          console.error("Verification error:", error.message);
          router.push("/auth"); // Optionally add ?error=failed to show a toast on the login page
          return;
        }

        // 3. Verification successful! User is automatically logged in.
        router.push("/tasks");
      } else {
        // Fallback: If there is no token in the URL, check if they are already logged in
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          router.push("/tasks");
        } else {
          router.push("/auth");
        }
      }
    };

    handleEmailVerify();
  }, [router, searchParams]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", alignItems: "center", justifyContent: "center", bgcolor: "#fafafa" }}>
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6" color="text.secondary">
        Verifying your email...
      </Typography>
    </Box>
  );
}

// Wrap in Suspense to prevent Next.js client-side de-opt build warnings
export default function AuthCallback() {
  return (
    <Suspense fallback={
      <Box sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    }>
      <VerifyEmailLogic />
    </Suspense>
  );
}