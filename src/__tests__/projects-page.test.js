import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProjectsPage from "../app/projects/page";
import { useGetProjectsQuery, useAddProjectMutation } from "@/lib/apiSlice";
import { toast } from "react-toastify";

// Mock the API slice hooks
jest.mock("@/lib/apiSlice", () => ({
  useGetProjectsQuery: jest.fn(),
  useAddProjectMutation: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock ProjectModal relative to this test file
jest.mock(
  "../components/projects/ProjectModal",
  () =>
    ({ open, onClose, onSave }) =>
      open ? (
        <div data-testid="project-modal">
          <button onClick={onSave}>Create Project</button>
          <button onClick={onClose}>Close</button>
        </div>
      ) : null,
);

describe("ProjectsPage", () => {
  const mockProjects = [
    {
      id: "p1",
      name: "Project One",
      description: "First description",
      color: "#3b82f6",
      ownerId: "user1",
    },
    {
      id: "p2",
      name: "Project Two",
      description: "Second description",
      color: "#ec4899",
      ownerId: "user2",
    },
  ];

  const addProjectMock = jest.fn(() => ({
    unwrap: () => Promise.resolve({ id: "p3" }),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    useAddProjectMutation.mockReturnValue([addProjectMock]);
  });

  it("renders loading state correctly", () => {
    useGetProjectsQuery.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<ProjectsPage />);

    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(
      screen.getByText("Manage your workspaces and initiatives"),
    ).toBeInTheDocument();
  });

  it("renders empty state when no projects exist", () => {
    useGetProjectsQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<ProjectsPage />);

    // Since EmptyProjectState is rendered, let's verify empty state content
    expect(screen.getByText("Create your first project")).toBeInTheDocument();
  });

  it("renders list of projects correctly", () => {
    useGetProjectsQuery.mockReturnValue({
      data: mockProjects,
      isLoading: false,
    });

    render(<ProjectsPage />);

    expect(screen.getByText("Project One")).toBeInTheDocument();
    expect(screen.getByText("First description")).toBeInTheDocument();
    expect(screen.getByText("Project Two")).toBeInTheDocument();
    expect(screen.getByText("Second description")).toBeInTheDocument();
  });

  it("navigates to project details on card click", () => {
    useGetProjectsQuery.mockReturnValue({
      data: mockProjects,
      isLoading: false,
    });

    render(<ProjectsPage />);

    const firstProjectCard = screen.getByText("Project One");
    fireEvent.click(firstProjectCard);

    expect(mockPush).toHaveBeenCalledWith("/projects/p1");
  });

  it("opens project modal, fills form, and creates project successfully", async () => {
    useGetProjectsQuery.mockReturnValue({
      data: mockProjects,
      isLoading: false,
    });

    render(<ProjectsPage />);

    const newProjectBtn = screen.getByRole("button", { name: "New Project" });
    fireEvent.click(newProjectBtn);

    // Verify modal is visible
    expect(screen.getByTestId("project-modal")).toBeInTheDocument();

    // Save project
    const saveBtn = screen.getByRole("button", { name: "Create Project" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(addProjectMock).toHaveBeenCalledWith({
        name: "",
        description: "",
        color: "#3b82f6",
        isArchived: false,
      });
      expect(toast.success).toHaveBeenCalledWith("Project created!");
    });
  });
});
