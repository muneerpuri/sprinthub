import React, { useMemo } from "react";
import { Box, Fade, CircularProgress } from "@mui/material";
import { Kanban } from "react-kanban-kit";
import TaskCard from "./TaskCard";

/**
 * @typedef {Object} KanbanBoardProps
 * @property {Object} board - The formatted board data structure.
 * @property {number} boardKey - Key used to force Kanban re-renders.
 * @property {boolean} isLoading - Current loading state.
 * @property {Array} tasks - Original task array for component lookup.
 * @property {Function} onCardMove - Handler triggered when a card is dropped into a new column.
 * @property {Function} onTaskClick - Handler to view/edit task details.
 * @property {Function} onTaskDelete - Handler to delete a task.
 * @property {Function} onTaskStatusChange - Handler to directly change a task's status via dropdown/buttons.
 */

/**
 * Renders the interactive Kanban board and maps columns to UI cards.
 *
 * @param {KanbanBoardProps} props - The component props.
 * @returns {JSX.Element}
 */
export default function KanbanBoard({
  board,
  boardKey,
  isLoading,
  tasks,
  onCardMove,
  onTaskClick,
  onTaskDelete,
  onTaskStatusChange,
}) {
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
              onClick={onTaskClick}
              onDelete={onTaskDelete}
              onMove={(targetStatus) =>
                onTaskStatusChange(taskDetails.id, targetStatus)
              }
            />
          );
        },
        isDraggable: true,
      },
    }),
    [tasks, onTaskClick, onTaskDelete, onTaskStatusChange],
  );

  if (isLoading || !board) {
    return (
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
    );
  }

  return (
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
          onCardMove={onCardMove}
        />
      </Box>
    </Fade>
  );
}
