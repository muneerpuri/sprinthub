import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AuthCallback from "../app/auth/callback/page";
import { supabase } from "@/utils/supabase";
import { useRouter, useSearchParams } from "next/navigation";

const mockPush = jest.fn();
const mockGet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

describe("AuthCallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    supabase.auth.verifyOtp = jest.fn();
    supabase.auth.getSession = jest.fn();
  });

  it("verifies OTP and redirects to /tasks if code parameter is present and verification succeeds", async () => {
    mockGet.mockReturnValueOnce("test-code");
    supabase.auth.verifyOtp.mockResolvedValueOnce({
      data: { user: {} },
      error: null,
    });

    render(<AuthCallback />);

    expect(screen.getByText("Verifying your email...")).toBeInTheDocument();

    await waitFor(() => {
      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: "test-code",
        type: "signup",
      });
      expect(mockPush).toHaveBeenCalledWith("/tasks");
    });
  });

  it("redirects to /auth if verification fails with error", async () => {
    mockGet.mockReturnValueOnce("test-code");
    supabase.auth.verifyOtp.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid code" },
    });

    render(<AuthCallback />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth");
    });
  });

  it("checks session and redirects to /tasks if code parameter is absent but user is logged in", async () => {
    mockGet.mockReturnValueOnce(null);
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: {} } },
      error: null,
    });

    render(<AuthCallback />);

    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/tasks");
    });
  });

  it("checks session and redirects to /auth if code parameter is absent and user is not logged in", async () => {
    mockGet.mockReturnValueOnce(null);
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    render(<AuthCallback />);

    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/auth");
    });
  });
});
