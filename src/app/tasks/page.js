"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Box, Fade, CircularProgress } from "@mui/material";
import { Kanban, dropHandler } from "react-kanban-kit";
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
import TaskCard from "../../components/tasks/TaskCard";
import DashboardLayout from "../../components/layout/DashboardLayout";

/**
 * Stable empty array defined outside of render scope to prevent reference loops.
 * @type {Array}
 */
const EMPTY_ARRAY = [];

/**
 * Tasks component that displays a Kanban board for task management.
 * It integrates with a Redux API slice for fetching, adding, updating, and deleting tasks.
 *
 * @returns {JSX.Element} The Tasks Kanban board.
 */
export default function Tasks() {
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
      buildBoard(tasksData);
    }
  }, [tasksData]);

  // Load drag-drop-touch polyfill on client side for mobile touch support
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("drag-drop-touch");
    }
  }, []);

  const buildBoard = (tasksData) => {
    const grouped = { PENDING: [], IN_PROGRESS: [], COMPLETED: [] };

    tasksData.forEach((t) => {
      const status = (t.status || "PENDING").toUpperCase();
      if (status === "IN_PROGRESS") grouped.IN_PROGRESS.push(t);
      else if (status === "COMPLETED") grouped.COMPLETED.push(t);
      else grouped.PENDING.push(t);
    });

    const data = {
      root: {
        id: "root",
        type: "board",
        children: ["todo", "progress", "done"],
      },
      todo: {
        id: "todo",
        type: "column",
        title: "To Do",
        children: grouped.PENDING.map((t) => String(t.id)),
        totalChildrenCount: grouped.PENDING.length,
        parentId: "root",
      },
      progress: {
        id: "progress",
        type: "column",
        title: "In Progress",
        children: grouped.IN_PROGRESS.map((t) => String(t.id)),
        totalChildrenCount: grouped.IN_PROGRESS.length,
        parentId: "root",
      },
      done: {
        id: "done",
        type: "column",
        title: "Done",
        children: grouped.COMPLETED.map((t) => String(t.id)),
        totalChildrenCount: grouped.COMPLETED.length,
        parentId: "root",
      },
    };

    tasksData.forEach((t) => {
      const status = (t.status || "PENDING").toUpperCase();
      data[String(t.id)] = {
        id: String(t.id),
        type: "card",
        title: t.title,
        parentId:
          status === "IN_PROGRESS"
            ? "progress"
            : status === "COMPLETED"
              ? "done"
              : "todo",
        task: t,
      };
    });

    setBoard(data);
  };

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
    const statusMap = {
      todo: "PENDING",
      progress: "IN_PROGRESS",
      done: "COMPLETED",
    };
    const newStatus = statusMap[move.toColumnId];

    const updatedBoard = dropHandler(move, board);
    if (updatedBoard[move.cardId])
      updatedBoard[move.cardId].parentId = move.toColumnId;
    setBoard(updatedBoard);

    try {
      await updateTask({ id: move.cardId, status: newStatus }).unwrap();
    } catch (err) {
      toast.error("Failed to move task");
    }
  };

  const configMap = useMemo(
    () => ({
      card: {
        render: (props) => {
          const id = props.id || props.card?.id || props.data?.id;
          const taskDetails =
            props.task ||
            props.data?.task ||
            tasks.find((t) => String(t.id) === String(id));

          if (!taskDetails) return <Box p={2}>Error loading task</Box>;
          return (
            <TaskCard
              task={taskDetails}
              onClick={setActiveTask}
              onDelete={handleDeleteTask}
              onMove={(targetStatus) => {
                updateTask({ id: taskDetails.id, status: targetStatus });
              }}
            />
          );
        },
        isDraggable: true,
      },
    }),
    [tasks, updateTask],
  );

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
          {isLoading || !board ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Fade in={true} timeout={800}>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "1200px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Kanban
                  key={boardKey}
                  dataSource={board}
                  configMap={configMap}
                  virtualization={false}
                  onCardMove={handleCardMove}
                />
              </Box>
            </Fade>
          )}
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
