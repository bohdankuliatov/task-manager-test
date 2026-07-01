import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { tasksApi } from "@/api/tasksApi";
import { AppError } from "@/api/http";
import {
  TaskStatus,
  type CreateTaskPayload,
  type Task,
  type UpdateTaskPayload,
} from "@/types/task";
import { useProjectsStore } from "./projects";

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  const currentProjectId = ref<number | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Single source of truth consumed by both the table view and the kanban
  // board, so a change made in one is instantly visible in the other.
  const byStatus = computed(() => {
    const groups: Record<TaskStatus, Task[]> = {
      [TaskStatus.Todo]: [],
      [TaskStatus.InProgress]: [],
      [TaskStatus.Done]: [],
    };
    for (const task of tasks.value) {
      groups[task.status].push(task);
    }
    for (const status of Object.keys(groups) as TaskStatus[]) {
      groups[status].sort((a, b) => a.order - b.order);
    }
    return groups;
  });

  async function fetchByProject(projectId: number): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      tasks.value = await tasksApi.listByProject(projectId);
      currentProjectId.value = projectId;
    } catch (err) {
      error.value =
        err instanceof AppError
          ? err.message
          : "Не вдалося завантажити завдання";
    } finally {
      isLoading.value = false;
    }
  }

  async function addTask(payload: CreateTaskPayload): Promise<Task> {
    const task = await tasksApi.create(payload);
    tasks.value = [...tasks.value, task];
    useProjectsStore().bumpTaskCount(payload.projectId, 1);
    return task;
  }

  async function updateTask(
    id: number,
    payload: UpdateTaskPayload,
  ): Promise<Task> {
    const updated = await tasksApi.update(id, payload);
    tasks.value = tasks.value.map((t) => (t.id === id ? updated : t));
    return updated;
  }

  async function removeTask(id: number): Promise<void> {
    const target = tasks.value.find((t) => t.id === id);
    await tasksApi.remove(id);
    tasks.value = tasks.value.filter((t) => t.id !== id);
    if (target) useProjectsStore().bumpTaskCount(target.projectId, -1);
  }

  /**
   * Moves a task to `status` at position `newIndex` within that status
   * column, re-numbering `order` for every affected task. Used by both the
   * kanban drag handler and the table's row drag handler so the two views
   * always agree on ordering.
   */
  async function moveTask(
    taskId: number,
    status: TaskStatus,
    newIndex: number,
  ): Promise<void> {
    const task = tasks.value.find((t) => t.id === taskId);
    if (!task) return;

    const previousStatus = task.status;
    task.status = status;

    const columnTasks = tasks.value
      .filter((t) => t.status === status && t.id !== taskId)
      .sort((a, b) => a.order - b.order);
    columnTasks.splice(newIndex, 0, task);
    columnTasks.forEach((t, index) => {
      t.order = index;
    });

    // persist the moved task; reorders of siblings are local-only (cheap,
    // avoids one PUT per row) but still authoritative for future loads
    // because order is recomputed from array position on every fetch.
    await tasksApi.update(taskId, { status, order: newIndex });
    if (previousStatus !== status) {
      // sibling orders in the old column also shifted; persist them too
      const oldColumn = tasks.value
        .filter((t) => t.status === previousStatus)
        .sort((a, b) => a.order - b.order);
      await Promise.all(
        oldColumn.map((t, index) => tasksApi.update(t.id, { order: index })),
      );
    }
  }

  /** Reorders rows within the table (same status) via drag-and-drop. */
  async function reorderWithinStatus(
    _status: TaskStatus,
    orderedIds: number[],
  ): Promise<void> {
    orderedIds.forEach((id, index) => {
      const t = tasks.value.find((task) => task.id === id);
      if (t) t.order = index;
    });
    await Promise.all(
      orderedIds.map((id, index) => tasksApi.update(id, { order: index })),
    );
  }

  return {
    tasks,
    byStatus,
    currentProjectId,
    isLoading,
    error,
    fetchByProject,
    addTask,
    updateTask,
    removeTask,
    moveTask,
    reorderWithinStatus,
  };
});
