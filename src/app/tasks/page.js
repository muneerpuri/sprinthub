"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Box, MenuItem, Select, FormControl, InputLabel, TextField, Button } from "@mui/material";
import { dropHandler } from "react-kanban-kit";
import { toast } from "react-toastify";
import {
  useGetTasksQuery, 
  useGetColumnsQuery, 
  useGetProjectsListQuery,
  useAddTaskMutation, 
  useUpdateTaskMutation, 
  useDeleteTaskMutation,
  useGetProjectMembersQuery,
  useAddColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation
} from "../../lib/apiSlice";

import TaskHeader from "../../components/tasks/TaskHeader";
import CreateTaskModal from "../../components/tasks/CreateTaskModal";
import TaskDetailModal from "../../components/tasks/TaskDetailModal";
import KanbanBoard from "../../components/tasks/KanbanBoard";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { buildKanbanBoard } from "../../components/tasks/kanbanUtils";

const EMPTY_ARRAY = [];

export default function TasksPage() {
  const [addColumn] = useAddColumnMutation();
  const [updateColumn] = useUpdateColumnMutation();
  const [deleteColumn] = useDeleteColumnMutation();
  const { data: projects = EMPTY_ARRAY } = useGetProjectsListQuery();
  const [selectedProjectId, setSelectedProjectId] = useState("");

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) setSelectedProjectId(projects[0].id);
  }, [projects, selectedProjectId]);

  const { data: tasks = EMPTY_ARRAY, isLoading: tasksLoading } = useGetTasksQuery(selectedProjectId, { skip: !selectedProjectId });
  const { data: columns = EMPTY_ARRAY, isLoading: colsLoading } = useGetColumnsQuery(selectedProjectId, { skip: !selectedProjectId });
  
  const { data: members = EMPTY_ARRAY } = useGetProjectMembersQuery(selectedProjectId, { skip: !selectedProjectId });

  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [board, setBoard] = useState(null);
  const [boardKey, setBoardKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState(""); 

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || (t.description || "").toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority ? t.priority === filterPriority : true;
      const matchAssignee = filterAssignee ? t.assigneeId === filterAssignee : true;
      return matchSearch && matchPriority && matchAssignee;
    });
  }, [tasks, search, filterPriority, filterAssignee]);

  useEffect(() => {
    if (columns.length > 0) {
      setBoard(buildKanbanBoard(filteredTasks, columns));
    }
  }, [filteredTasks, columns]);

  useEffect(() => { if (typeof window !== "undefined") import("drag-drop-touch"); }, []);

  const handleCreate = async (values) => {
    try {
      await addTask({ ...values, projectId: selectedProjectId, columnId: columns[0].id }).unwrap();
      toast.success("Task created ✨");
      setCreateOpen(false);
    } catch (err) { toast.error("Create failed"); }
  };
  const handleAddColumn = async () => {
    if (!selectedProjectId) return;
    
    const columnName = prompt("Enter new column name:");
    if (!columnName) return;

    try {
      await addColumn({
        projectId: selectedProjectId,
        name: columnName,
        order: columns.length, 
      }).unwrap();
      toast.success("Column added!");
    } catch (err) {
      toast.error("Failed to add column");
    }
  };

  const handleColumnMove = async (move) => {
    const { columnId, fromIndex, toIndex } = move;
    const movedColId = columnId || move.laneId || move.id;

    if (board && fromIndex !== undefined && toIndex !== undefined && movedColId) {
      const updatedBoard = {
        ...board,
        root: {
          ...board.root,
          children: [...board.root.children],
        },
      };
      const [removed] = updatedBoard.root.children.splice(fromIndex, 1);
      updatedBoard.root.children.splice(toIndex, 0, removed);
      setBoard(updatedBoard);
    }

    try {
      await updateColumn({
        id: movedColId,
        order: toIndex
      }).unwrap();
    } catch (err) {
      toast.error("Failed to reorder column");
    }
  };

  const handleUpdateTask = async () => {
    if (!activeTask) return;
    try {
      delete activeTask?.assignee
      await updateTask({ id: activeTask.id, ...activeTask }).unwrap();
      toast.success("Task updated");
      setActiveTask(null);
    } catch (err) { toast.error("Update failed"); }
  };

  const handleDeleteTask = async (task) => {
    try {
      await deleteTask(task.id).unwrap();
      toast.success("Task deleted");
      if (activeTask?.id === task.id) setActiveTask(null);
      setBoardKey(prev => prev + 1);
    } catch (err) { toast.error("Delete failed"); }
  };

  const handleCardMove = async (move) => {
    const targetColumnId = move.toColumnId;
    const updatedBoard = dropHandler(move, board);
    if (updatedBoard[move.cardId]) updatedBoard[move.cardId].parentId = targetColumnId;
    setBoard(updatedBoard);

    try { await updateTask({ id: move.cardId, columnId: targetColumnId }).unwrap(); }
    catch (err) { toast.error("Failed to move task"); }
  };

  const handleColumnDelete = async (columnId) => {
    try {
      await deleteColumn(columnId).unwrap();
      toast.success("Column deleted");
      setBoardKey(prev => prev + 1);
    } catch (err) {
      const message = err?.data?.message || err?.message || "Failed to delete column";
      toast.error(message);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
        
        {/* Workspace & Filters */}
        <Box sx={{ display: "flex", gap: 2, p: 2, bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider", flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Select Project</InputLabel>
            <Select value={selectedProjectId} label="Select Project" onChange={(e) => setSelectedProjectId(e.target.value)}>
              {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          
          <TextField size="small" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority Filter</InputLabel>
            <Select value={filterPriority} label="Priority Filter" onChange={(e) => setFilterPriority(e.target.value)}>
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          {/* New Assignee Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Assignee Filter</InputLabel>
            <Select value={filterAssignee} label="Assignee Filter" onChange={(e) => setFilterAssignee(e.target.value)}>
              <MenuItem value="">All Users</MenuItem>
              {members.map(member => (
                <MenuItem key={member.userId} value={member.userId}>
                  {member.users?.firstName} {member.users?.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TaskHeader onCreateClick={() => setCreateOpen(true)} />

        <Box sx={{ flexGrow: 1, py: 4, display: "flex", justifyContent: "flex-start", overflowX: "auto", bgcolor: "background.default" }}>
          <KanbanBoard
            board={board}
            boardKey={boardKey}
            isLoading={tasksLoading || colsLoading}
            tasks={tasks}
            onCardMove={handleCardMove}
            onColumnMove={handleColumnMove} 
            onTaskClick={setActiveTask}
            onTaskDelete={handleDeleteTask}
            onTaskStatusChange={(taskId, colId) => updateTask({ id: taskId, columnId: colId })}
            onColumnDelete={handleColumnDelete}
          />

        </Box>
          {selectedProjectId && (
            <Box sx={{ minWidth: 250, ml: 2, pt: 1 }}>
               <Button 
                 variant="outlined" 
                 fullWidth 
                 sx={{ height: 50, borderStyle: 'dashed' }}
                 onClick={handleAddColumn}
               >
                 + Add Column
               </Button>
            </Box>
          )}

        {selectedProjectId && (
          <CreateTaskModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} projectId={selectedProjectId} />
        )}
        <TaskDetailModal activeTask={activeTask} setActiveTask={setActiveTask} onClose={() => setActiveTask(null)} onSave={handleUpdateTask} onDelete={handleDeleteTask} />
      </Box>
    </DashboardLayout>
  );
}