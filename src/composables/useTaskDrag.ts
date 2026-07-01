import { useTasksStore } from '@/stores/tasks'
import { TaskStatus, type Task } from '@/types/task'

interface SortableMovedEvent {
  moved?: { element: Task; newIndex: number }
  added?: { element: Task; newIndex: number }
}

/**
 * Bridges vuedraggable's change events to the tasks store, so both the
 * kanban board and the tasks table share one place that knows how ordering
 * and status updates are persisted.
 */
export function useTaskDrag() {
  const tasksStore = useTasksStore()

  /** Handler for a single kanban column's `@change` event. */
  function onKanbanChange(status: TaskStatus, event: SortableMovedEvent): void {
    const payload = event.moved ?? event.added
    if (!payload) return
    void tasksStore.moveTask(payload.element.id, status, payload.newIndex)
  }

  /**
   * Handler for the tasks table's row drag. Receives the full, newly
   * ordered list of *visible* rows and re-derives per-status ordering from
   * it, so the kanban board stays in sync automatically (single store,
   * single `order` field).
   */
  async function onTableReorder(newOrderedTasks: Task[]): Promise<void> {
    const byStatus = new Map<TaskStatus, number[]>()
    for (const task of newOrderedTasks) {
      const list = byStatus.get(task.status) ?? []
      list.push(task.id)
      byStatus.set(task.status, list)
    }
    await Promise.all(
      Array.from(byStatus.entries()).map(([status, ids]) => tasksStore.reorderWithinStatus(status, ids))
    )
  }

  return { onKanbanChange, onTableReorder }
}
