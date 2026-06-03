import React from "react";
import { render, screen } from "@testing-library/react";
import DashboardPage from "../app/page";
import { useGetTasksQuery } from "../lib/apiSlice";

// Mock the API slice hooks
jest.mock("../lib/apiSlice", () => ({
  useGetTasksQuery: jest.fn(),
}));

describe("DashboardPage", () => {
  const mockTasks = [
    { id: 1, title: "Task 1", status: "COMPLETED", priority: "high" },
    { id: 2, title: "Task 2", status: "PENDING", priority: "medium" },
    { id: 3, title: "Task 3", status: "IN_PROGRESS", priority: "low" },
    { id: 4, title: "Task 4", status: "PENDING", priority: "high" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state correctly", () => {
    useGetTasksQuery.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<DashboardPage />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Welcome back! Here's a snapshot of your current workload.",
      ),
    ).toBeInTheDocument();
  });

  it("renders statistics correctly with tasks", () => {
    useGetTasksQuery.mockReturnValue({
      data: mockTasks,
      isLoading: false,
    });

    render(<DashboardPage />);

    // Verify stat cards contain correct values inside their container boxes/cards
    const totalTasksCard = screen
      .getByText("Total Tasks")
      .closest(".MuiPaper-root");
    expect(totalTasksCard).toHaveTextContent("4");

    const completedCard = screen
      .getByText("Completed")
      .closest(".MuiPaper-root");
    expect(completedCard).toHaveTextContent("1");

    const pendingCard = screen
      .getByText("Pending / In Progress")
      .closest(".MuiPaper-root");
    expect(pendingCard).toHaveTextContent("3");

    const highPriorityCard = screen
      .getByText("High Priority")
      .closest(".MuiPaper-root");
    expect(highPriorityCard).toHaveTextContent("2");
  });
});
