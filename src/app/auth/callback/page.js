"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../utils/supabase";
import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * VerifyEmailLogic component handles the email verification process after a user clicks a confirmation link.
 * It extracts the token from the URL, verifies it with Supabase, and redirects the user accordingly.
 *
 * @returns {JSX.Element} A loading spinner and message during the verification process.
 */
function VerifyEmailLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailVerify = async () => {
      const code = searchParams.get("code");
      const type = searchParams.get("type") || "";

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Verification error:", error.message);
          router.push("/auth?error=verification_failed");
          return;
        }

        if (type === "email_change") {
          router.push("/settings/profile");
        } else {
          router.push("/tasks");
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fafafa",
      }}
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6" color="text.secondary">
        Verifying your email...
      </Typography>
    </Box>
  );
}

/**
 * AuthCallback component serves as a wrapper for VerifyEmailLogic, providing Suspense fallback.
 * This is to prevent Next.js client-side de-optimization warnings.
 *
 * @returns {JSX.Element} The VerifyEmailLogic component wrapped in Suspense.
 */
export default function AuthCallback() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <VerifyEmailLogic />
    </Suspense>
  );
}
