import React from "react";

// Unmock DashboardLayout to test its actual logic
jest.unmock("../components/layout/DashboardLayout");

import { render, fireEvent } from "@testing-library/react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useGetCurrentUserQuery } from "@/lib/apiSlice";

// Mock the API slice hooks
jest.mock("@/lib/apiSlice", () => ({
  useGetCurrentUserQuery: jest.fn(() => ({ data: "u1", isLoading: false })),
  apiSlice: {
    util: {
      resetApiState: jest.fn(),
    },
  },
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/",
}));

describe("DashboardLayout Keyboard Shortcuts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("navigates to dashboard on Shift+D", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    fireEvent.keyDown(window, { shiftKey: true, key: "D" });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("navigates to projects on Shift+P", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    fireEvent.keyDown(window, { shiftKey: true, key: "P" });
    expect(mockPush).toHaveBeenCalledWith("/projects");
  });

  it("navigates to tasks on Shift+T", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    fireEvent.keyDown(window, { shiftKey: true, key: "T" });
    expect(mockPush).toHaveBeenCalledWith("/tasks");
  });

  it("does not navigate if shift is not pressed", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    fireEvent.keyDown(window, { shiftKey: false, key: "d" });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not navigate if keyboard shortcut is pressed inside a text input", () => {
    const { container } = render(
      <DashboardLayout>
        <input data-testid="test-input" type="text" />
      </DashboardLayout>
    );

    const input = container.querySelector("input");
    input.focus();

    fireEvent.keyDown(input, { shiftKey: true, key: "P" });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
