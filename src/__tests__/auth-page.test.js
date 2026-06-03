import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthPage from "../app/auth/page";
import { supabase } from "@/utils/supabase";
import { toast } from "react-toastify";

// Mock router redirection
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/auth",
}));

describe("AuthPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default getSession to returning no session
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it("redirects to /tasks if user is already logged in", async () => {
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: "test-user-id" } } },
      error: null,
    });

    render(<AuthPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/tasks");
    });
  });

  it("renders login form by default and can switch to signup", () => {
    render(<AuthPage />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(
      screen.getByText("Enter your details to access your dashboard."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/First Name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Last Name/i)).not.toBeInTheDocument();

    // Switch to signup
    const toggleButton = screen.getByText("Don't have an account? Sign up");
    fireEvent.click(toggleButton);

    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(
      screen.getByText("Start organizing your life in seconds."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
  });

  it("handles login form submission successfully", async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: {} },
      error: null,
    });

    render(<AuthPage />);

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    const submitBtn = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(toast.success).toHaveBeenCalledWith("Welcome back!");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("handles login failure with toast notification", async () => {
    const mockError = { message: "Invalid credentials" };
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    render(<AuthPage />);

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrong" },
    });

    const submitBtn = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  it("handles signup form submission successfully", async () => {
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: {} },
      error: null,
    });

    render(<AuthPage />);

    // Toggle to Sign Up
    fireEvent.click(screen.getByText("Don't have an account? Sign up"));

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    const submitBtn = screen.getByRole("button", { name: "Sign Up" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "john@example.com",
        password: "password123",
        options: {
          data: {
            firstName: "John",
            lastName: "Doe",
          },
        },
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Account created! You can now log in.",
      );
    });
  });
});
