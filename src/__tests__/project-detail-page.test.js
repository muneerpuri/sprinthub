import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProjectDetailsPage from "../app/projects/[id]/page";
import { useParams } from "next/navigation";
import {
  useGetProjectByIdQuery,
  useGetProjectMembersQuery,
  useInviteUserToProjectMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetCurrentUserQuery,
  useGetTasksQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "@/lib/apiSlice";
import { toast } from "react-toastify";

// Mock the API slice hooks using the alias path
jest.mock("@/lib/apiSlice", () => ({
  useGetCurrentUserQuery: jest.fn(),
  useGetProjectByIdQuery: jest.fn(),
  useGetProjectMembersQuery: jest.fn(),
  useGetTasksQuery: jest.fn(),
  useInviteUserToProjectMutation: jest.fn(),
  useUpdateMemberRoleMutation: jest.fn(),
  useRemoveMemberMutation: jest.fn(),
  useUpdateProjectMutation: jest.fn(),
  useDeleteProjectMutation: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: jest.fn(),
}));

// Mock subcomponents relative to this test file
jest.mock(
  "../components/projects/details/ProjectHeader",
  () =>
    ({ project, onEdit, onDelete }) => (
      <div data-testid="project-header">
        <h1>{project.name}</h1>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    ),
);
jest.mock(
  "../components/projects/details/ProjectTasksTab",
  () =>
    ({ tasks }) => (
      <div data-testid="tasks-tab">Tasks Count: {tasks.length}</div>
    ),
);
jest.mock(
  "../components/projects/details/ProjectMembersTab",
  () =>
    ({ members, onInvite, onRoleChange, onRemove }) => (
      <div data-testid="members-tab">
        Members Count: {members.length}
        <button onClick={() => onInvite("invite@test.com", "editor")}>
          Invite
        </button>
        <button onClick={() => onRoleChange("m1", "viewer")}>
          Change Role
        </button>
        <button onClick={() => onRemove("m1")}>Remove Member</button>
      </div>
    ),
);
jest.mock(
  "../components/projects/ProjectModal",
  () =>
    ({ open, onClose, onSave }) =>
      open ? (
        <div data-testid="project-modal">
          <button onClick={onSave}>Save Project</button>
          <button onClick={onClose}>Close</button>
        </div>
      ) : null,
);

describe("ProjectDetailsPage", () => {
  const projectId = "p1";
  const mockCurrentUser = "u1";

  const mockProject = {
    id: projectId,
    name: "Project One",
    description: "Detail description",
    color: "#3b82f6",
    ownerId: "u1",
  };

  const mockMembers = [
    {
      id: "m1",
      userId: "u1",
      role: "owner",
      users: { firstName: "John", lastName: "Doe", email: "john@example.com" },
    },
    {
      id: "m2",
      userId: "u2",
      role: "viewer",
      users: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
      },
    },
  ];

  const mockTasks = [
    { id: "t1", projectId: "p1", title: "Task for P1" },
    { id: "t2", projectId: "p2", title: "Task for P2" },
  ];

  // Mutation Mock functions
  const inviteUserMock = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
  const updateRoleMock = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
  const removeMemberMock = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
  const updateProjectMock = jest.fn(() => ({
    unwrap: () => Promise.resolve(),
  }));
  const deleteProjectMock = jest.fn(() => ({
    unwrap: () => Promise.resolve(),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ id: projectId });
    useGetCurrentUserQuery.mockReturnValue({ data: mockCurrentUser });
    useGetProjectByIdQuery.mockReturnValue({
      data: mockProject,
      isLoading: false,
    });
    useGetProjectMembersQuery.mockReturnValue({
      data: mockMembers,
      isLoading: false,
    });
    useGetTasksQuery.mockReturnValue({ data: mockTasks, isLoading: false });

    useInviteUserToProjectMutation.mockReturnValue([
      inviteUserMock,
      { isLoading: false },
    ]);
    useUpdateMemberRoleMutation.mockReturnValue([updateRoleMock]);
    useRemoveMemberMutation.mockReturnValue([removeMemberMock]);
    useUpdateProjectMutation.mockReturnValue([updateProjectMock]);
    useDeleteProjectMutation.mockReturnValue([deleteProjectMock]);

    window.confirm = jest.fn(() => true);
  });

  it("renders loading state", () => {
    useGetProjectByIdQuery.mockReturnValue({ data: null, isLoading: true });

    render(<ProjectDetailsPage />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders project not found", () => {
    useGetProjectByIdQuery.mockReturnValue({ data: null, isLoading: false });

    render(<ProjectDetailsPage />);
    expect(screen.getByText("Project not found.")).toBeInTheDocument();
  });

  it("renders header and tabs successfully", () => {
    render(<ProjectDetailsPage />);

    expect(screen.getByTestId("project-header")).toBeInTheDocument();
    expect(screen.getByText("Project One")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Members & Invites")).toBeInTheDocument();
  });

  it("renders the Tasks tab by default and filters project tasks", () => {
    render(<ProjectDetailsPage />);

    expect(screen.getByTestId("tasks-tab")).toBeInTheDocument();
    // Only 1 task has projectId === "p1"
    expect(screen.getByText("Tasks Count: 1")).toBeInTheDocument();
  });

  it("can switch tabs to Members and perform invite", async () => {
    render(<ProjectDetailsPage />);

    const membersTabBtn = screen.getByText("Members & Invites");
    fireEvent.click(membersTabBtn);

    expect(screen.getByTestId("members-tab")).toBeInTheDocument();
    expect(screen.getByText("Members Count: 2")).toBeInTheDocument();

    const inviteBtn = screen.getByText("Invite");
    fireEvent.click(inviteBtn);

    await waitFor(() => {
      expect(inviteUserMock).toHaveBeenCalledWith({
        projectId: "p1",
        email: "invite@test.com",
        role: "editor",
      });
      expect(toast.success).toHaveBeenCalledWith("User invited successfully!");
    });
  });

  it("can change roles and remove members from the members tab", async () => {
    render(<ProjectDetailsPage />);

    const membersTabBtn = screen.getByText("Members & Invites");
    fireEvent.click(membersTabBtn);

    // Change role
    fireEvent.click(screen.getByText("Change Role"));
    await waitFor(() => {
      expect(updateRoleMock).toHaveBeenCalledWith({
        memberId: "m1",
        role: "viewer",
      });
      expect(toast.success).toHaveBeenCalledWith("Role updated");
    });

    // Remove member
    fireEvent.click(screen.getByText("Remove Member"));
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        "Remove this user from the project?",
      );
      expect(removeMemberMock).toHaveBeenCalledWith("m1");
      expect(toast.success).toHaveBeenCalledWith("User removed");
    });
  });

  it("handles project updating successfully", async () => {
    render(<ProjectDetailsPage />);

    const editBtn = screen.getByText("Edit");
    fireEvent.click(editBtn);

    expect(screen.getByTestId("project-modal")).toBeInTheDocument();

    const saveProjectBtn = screen.getByText("Save Project");
    fireEvent.click(saveProjectBtn);

    await waitFor(() => {
      expect(updateProjectMock).toHaveBeenCalledWith({
        id: "p1",
        name: "Project One",
        description: "Detail description",
        color: "#3b82f6",
        isArchived: false,
      });
      expect(toast.success).toHaveBeenCalledWith("Project updated!");
    });
  });

  it("handles project deletion successfully", async () => {
    render(<ProjectDetailsPage />);

    const deleteBtn = screen.getByText("Delete");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        "Are you sure you want to delete this project entirely? This cannot be undone.",
      );
      expect(deleteProjectMock).toHaveBeenCalledWith("p1");
      expect(toast.success).toHaveBeenCalledWith("Project deleted");
      expect(mockPush).toHaveBeenCalledWith("/projects");
    });
  });
});
