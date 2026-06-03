"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { dropHandler } from "react-kanban-kit";
import { toast } from "react-toastify";
import {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../../lib/apiSlice";

import TaskHeader from "../../components/tasks/TaskHeader";
import CreateTaskModal from "../../components/tasks/CreateTaskModal";
import TaskDetailModal from "../../components/tasks/TaskDetailModal";
import KanbanBoard from "../../components/tasks/KanbanBoard";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { buildKanbanBoard, COLUMN_STATUS_MAP } from "../../components/tasks/kanbanUtils";

const EMPTY_ARRAY = [];

/**
 * Primary Tasks page coordinating Kanban board state and Redux API updates.
 *
 * @returns {JSX.Element}
 */
export default function TasksPage() {
  const { data: tasksData, isLoading } = useGetTasksQuery();
  const tasks = tasksData || EMPTY_ARRAY;

  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [board, setBoard] = useState(null);
  const [boardKey, setBoardKey] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    storyPoints: 1,
    labels: [],
  });

  useEffect(() => {
    if (tasksData) {
      setBoard(buildKanbanBoard(tasksData));
    }
  }, [tasksData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("drag-drop-touch");
    }
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.warning("Task title required");
    try {
      await addTask({ ...form, status: "PENDING" }).unwrap();
      toast.success("Task created ✨");
      setCreateOpen(false);
      setForm({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        storyPoints: 1,
        labels: [],
      });
    } catch (err) {
      toast.error("Create failed");
    }
  };

  const handleUpdateTask = async () => {
    if (!activeTask) return;
    try {
      await updateTask({ id: activeTask.id, ...activeTask }).unwrap();
      toast.success("Task updated");
      setActiveTask(null);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDeleteTask = async (task) => {
    if (!task?.id) return;
    try {
      await deleteTask(task.id).unwrap();
      toast.success("Task deleted");

      if (activeTask?.id === task.id) setActiveTask(null);
      setBoardKey((prev) => prev + 1);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleCardMove = async (move) => {
    const newStatus = COLUMN_STATUS_MAP[move.toColumnId];
    const updatedBoard = dropHandler(move, board);
    
    if (updatedBoard[move.cardId]) {
      updatedBoard[move.cardId].parentId = move.toColumnId;
    }
    setBoard(updatedBoard);

    try {
      await updateTask({ id: move.cardId, status: newStatus }).unwrap();
    } catch (err) {
      toast.error("Failed to move task");
    }
  };

  const handleTaskStatusChange = async (taskId, targetStatus) => {
    try {
      await updateTask({ id: taskId, status: targetStatus }).unwrap();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <DashboardLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 80px)",
        }}
      >
        <TaskHeader onCreateClick={() => setCreateOpen(true)} />

        <Box
          sx={{
            flexGrow: 1,
            py: 4,
            display: "flex",
            justifyContent: "flex-start",
            overflowX: "auto",
            bgcolor: "background.default",
          }}
        >
          <KanbanBoard
            board={board}
            boardKey={boardKey}
            isLoading={isLoading}
            tasks={tasks}
            onCardMove={handleCardMove}
            onTaskClick={setActiveTask}
            onTaskDelete={handleDeleteTask}
            onTaskStatusChange={handleTaskStatusChange}
          />
        </Box>

        <CreateTaskModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          form={form}
          setForm={setForm}
          onCreate={handleCreate}
        />
        
        <TaskDetailModal
          activeTask={activeTask}
          setActiveTask={setActiveTask}
          onClose={() => setActiveTask(null)}
          onSave={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      </Box>
    </DashboardLayout>
  );
}