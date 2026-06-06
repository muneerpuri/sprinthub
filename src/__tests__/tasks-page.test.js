import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TasksPage from "../app/tasks/page";
import {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/lib/apiSlice";
import { toast } from "react-toastify";

// Mock the API slice hooks
jest.mock("@/lib/apiSlice", () => ({
  useGetTasksQuery: jest.fn(),
  useAddTaskMutation: jest.fn(),
  useUpdateTaskMutation: jest.fn(),
  useDeleteTaskMutation: jest.fn(),
}));

// Mock react-kanban-kit virtually to bypass JSDOM/ESM loading issues
jest.mock(
  "react-kanban-kit",
  () => ({
    dropHandler: jest.fn((move, board) => board),
  }),
  { virtual: true },
);

// Mock subcomponents relative to this test file
jest.mock("../components/tasks/TaskHeader", () => ({ onCreateClick }) => (
  <div data-testid="task-header">
    <button onClick={onCreateClick}>Create New Task</button>
  </div>
));
jest.mock(
  "../components/tasks/CreateTaskModal",
  () => {
    let internalForm = {
      title: "",
      projectId: "p1",
      description: "",
      dueDate: "2025-07-15T00:00:00.000Z",
      priority: "medium",
      storyPoints: 1,
      labels: [],
    };
    return ({ open, onClose, onCreate }) =>
      open ? (
        <div data-testid="create-modal">
          <input
            data-testid="task-title-input"
            value={internalForm.title}
            onChange={(e) => {
              internalForm = { ...internalForm, title: e.target.value };
            }}
          />
          <button
            onClick={() =>
              onCreate({
                ...internalForm,
                title: internalForm.title.trim(),
              })
            }
          >
            Save Task
          </button>
          <button
            onClick={() => {
              internalForm = {
                title: "",
                projectId: "p1",
                description: "",
                dueDate: "2025-07-15T00:00:00.000Z",
                priority: "medium",
                storyPoints: 1,
                labels: [],
              };
              onClose();
            }}
          >
            Close
          </button>
        </div>
      ) : null;
  },
);
jest.mock(
  "../components/tasks/TaskDetailModal",
  () =>
    ({ activeTask, setActiveTask, onSave, onDelete, onClose }) =>
      activeTask ? (
        <div data-testid="detail-modal">
          <input
            data-testid="edit-title-input"
            value={activeTask.title}
            onChange={(e) =>
              setActiveTask({ ...activeTask, title: e.target.value })
            }
          />
          <button onClick={onSave}>Update Task</button>
          <button onClick={() => onDelete(activeTask)}>Delete Task</button>
          <button onClick={onClose}>Close</button>
        </div>
      ) : null,
);
jest.mock(
  "../components/tasks/KanbanBoard",
  () =>
    ({ tasks, onCardMove, onTaskClick, onTaskDelete }) => (
      <div data-testid="kanban-board">
        {tasks.map((task) => (
          <div key={task.id} data-testid={`task-card-${task.id}`}>
            <span>{task.title}</span>
            <button onClick={() => onTaskClick(task)}>Edit Card</button>
            <button onClick={() => onTaskDelete(task)}>Delete Card</button>
            <button
              onClick={() =>
                onCardMove({
                  cardId: task.id,
                  toColumnId: "done",
                  fromColumnId: "todo",
                })
              }
            >
              Move Card
            </button>
          </div>
        ))}
      </div>
    ),
);

describe("TasksPage", () => {
  const mockTasks = [
    { id: "t1", title: "Task 1", status: "PENDING", priority: "medium" },
    { id: "t2", title: "Task 2", status: "COMPLETED", priority: "high" },
  ];

  const addTaskMock = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
  const updateTaskMock = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
  const deleteTaskMock = jest.fn(() => ({ unwrap: () => Promise.resolve() }));

  beforeEach(() => {
    jest.clearAllMocks();
    useGetTasksQuery.mockReturnValue({ data: mockTasks, isLoading: false });
    useAddTaskMutation.mockReturnValue([addTaskMock]);
    useUpdateTaskMutation.mockReturnValue([updateTaskMock]);
    useDeleteTaskMutation.mockReturnValue([deleteTaskMock]);
  });

  it("renders page header and Kanban board", () => {
    render(<TasksPage />);

    expect(screen.getByTestId("task-header")).toBeInTheDocument();
    expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("handles opening task modal, entering title, and creating task successfully", async () => {
    render(<TasksPage />);

    const openBtn = screen.getByText("Create New Task");
    fireEvent.click(openBtn);

    expect(screen.getByTestId("create-modal")).toBeInTheDocument();

    // Enter title
    const input = screen.getByTestId("task-title-input");
    fireEvent.change(input, { target: { value: "New Task Title" } });

    // Save task
    const saveBtn = screen.getByText("Save Task");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(addTaskMock).toHaveBeenCalledWith({
        title: "New Task Title",
        projectId: "p1",
        description: "",
        dueDate: "2025-07-15T00:00:00.000Z",
        priority: "medium",
        storyPoints: 1,
        labels: [],
        status: "PENDING",
      });
      expect(toast.success).toHaveBeenCalledWith("Task created ✨");
    });
  });

  it("handles editing and updating a task successfully", async () => {
    render(<TasksPage />);

    const editCardBtn = screen.getAllByText("Edit Card")[0];
    fireEvent.click(editCardBtn);

    expect(screen.getByTestId("detail-modal")).toBeInTheDocument();

    // Edit the title
    const input = screen.getByTestId("edit-title-input");
    fireEvent.change(input, { target: { value: "Updated Task Title" } });

    // Click Update Task
    const updateBtn = screen.getByText("Update Task");
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalledWith({
        id: "t1",
        title: "Updated Task Title",
        status: "PENDING",
        priority: "medium",
      });
      expect(toast.success).toHaveBeenCalledWith("Task updated");
    });
  });

  it("handles deleting a task from details modal", async () => {
    render(<TasksPage />);

    const editCardBtn = screen.getAllByText("Edit Card")[0];
    fireEvent.click(editCardBtn);

    const deleteBtn = screen.getByText("Delete Task");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteTaskMock).toHaveBeenCalledWith("t1");
      expect(toast.success).toHaveBeenCalledWith("Task deleted");
    });
  });

  it("handles deleting a task directly from card list", async () => {
    render(<TasksPage />);

    const deleteCardBtn = screen.getAllByText("Delete Card")[0];
    fireEvent.click(deleteCardBtn);

    await waitFor(() => {
      expect(deleteTaskMock).toHaveBeenCalledWith("t1");
      expect(toast.success).toHaveBeenCalledWith("Task deleted");
    });
  });

  it("handles moving a card on the Kanban board", async () => {
    render(<TasksPage />);

    const moveCardBtn = screen.getAllByText("Move Card")[0];
    fireEvent.click(moveCardBtn);

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalledWith({
        id: "t1",
        status: "COMPLETED",
      });
    });
  });
});
