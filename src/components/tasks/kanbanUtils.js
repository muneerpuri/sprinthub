export const buildKanbanBoard = (tasksData, columnsData) => {
  if (!columnsData || columnsData.length === 0) return null;

  const data = {
    root: { id: "root", type: "board", children: columnsData.map(c => c.id) },
  };

  // Build lanes based on dynamic columns
  columnsData.forEach((col) => {
    const colTasks = tasksData.filter(t => t.columnId === col.id);
    data[col.id] = {
      id: col.id,
      type: "column",
      title: col.name,
      children: colTasks.map(t => String(t.id)),
      totalChildrenCount: colTasks.length,
      parentId: "root"
    };
  });

  // Map tasks
  tasksData.forEach((t) => {
    data[String(t.id)] = {
      id: String(t.id),
      type: "card",
      title: t.title,
      parentId: t.columnId || columnsData[0].id, // fallback
      task: t,
    };
  });

  return data;
};