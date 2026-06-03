/**
 * Maps the Kanban column IDs to their corresponding API task statuses.
 * @type {Object<string, string>}
 */
export const COLUMN_STATUS_MAP = {
  todo: "PENDING",
  progress: "IN_PROGRESS",
  done: "COMPLETED",
};

/**
 * Transforms a list of tasks into the structure required by react-kanban-kit.
 *
 * @param {Array} tasksData - The array of task objects from the API.
 * @returns {Object} The formatted board data object.
 */
export const buildKanbanBoard = (tasksData) => {
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

  return data;
};
