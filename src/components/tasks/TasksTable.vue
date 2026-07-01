<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import draggable from 'vuedraggable'
import { useTableSort } from '@/composables/useTableSort'
import { useColumnResize } from '@/composables/useColumnResize'
import { useTaskDrag } from '@/composables/useTaskDrag'
import { formatDate } from '@/utils/date'
import { TaskStatus, type Task, type TaskSortField } from '@/types/task'

const props = defineProps<{ tasks: Task[] }>()
const emit = defineEmits<{ edit: [task: Task]; remove: [id: number] }>()

const tasksRef = toRef(props, 'tasks')
const localOrder = ref<Task[]>([...props.tasks])
watch(tasksRef, (value) => {
  localOrder.value = [...value]
})

const accessor = (task: Task, field: TaskSortField): string | number =>
  field === 'title' ? task.title.toLowerCase() : (task[field] as string)
const { sortField, sortDirection, toggleSort, sortedItems } = useTableSort<Task, TaskSortField>(localOrder, accessor)
const isDragDisabled = computed(() => sortField.value !== null)

const { widths, startResize } = useColumnResize({ id: 90, title: 300, assignee: 170, status: 150, dueDate: 150 })
const { onTableReorder } = useTaskDrag()

const columns: { id: TaskSortField | 'id' | 'assignee'; label: string; sortable: boolean }[] = [
  { id: 'id', label: 'ID', sortable: false },
  { id: 'title', label: 'Назва завдання', sortable: true },
  { id: 'assignee', label: 'Виконавець', sortable: false },
  { id: 'status', label: 'Статус', sortable: true },
  { id: 'dueDate', label: 'Термін', sortable: true }
]

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'До виконання',
  [TaskStatus.InProgress]: 'У роботі',
  [TaskStatus.Done]: 'Виконано'
}

const sortIndicator = computed(() => (field: TaskSortField) => {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? '↑' : '↓'
})

function onDragEnd(): void {
  void onTableReorder(localOrder.value)
}
</script>

<template>
  <div class="table-wrap">
    <p v-if="isDragDisabled" class="ttable__hint">Перетягування рядків доступне лише без активного сортування.</p>
    <table class="ptable ttable">
      <colgroup>
        <col v-for="col in columns" :key="col.id" :style="{ width: widths[col.id] + 'px' }" />
        <col style="width: 40px" />
        <col style="width: 150px" />
      </colgroup>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.id">
            <button
              v-if="col.sortable"
              type="button"
              class="ptable__sort"
              @click="toggleSort(col.id as TaskSortField)"
            >
              {{ col.label }} <span class="ptable__sort-icon">{{ sortIndicator(col.id as TaskSortField) }}</span>
            </button>
            <span v-else class="ttable__label">{{ col.label }}</span>
            <span class="ptable__resizer" @pointerdown="(e) => startResize(col.id, e)" />
          </th>
          <th></th>
          <th>Дії</th>
        </tr>
      </thead>
      <draggable
        v-model="localOrder"
        tag="tbody"
        item-key="id"
        handle=".ttable__handle"
        :disabled="isDragDisabled"
        @end="onDragEnd"
      >
        <template #item="{ element: task }">
          <tr class="ptable__row ttable__row">
            <td><span class="ledger-id">#{{ String(task.id).padStart(4, '0') }}</span></td>
            <td>{{ task.title }}</td>
            <td>{{ task.assignee ?? '—' }}</td>
            <td><span class="chip" :class="`chip--${task.status}`">{{ statusLabels[task.status] }}</span></td>
            <td>{{ formatDate(task.dueDate) }}</td>
            <td class="ttable__handle" title="Перетягніть для зміни порядку">⠿</td>
            <td class="ptable__actions">
              <button class="btn btn--ghost btn--sm" type="button" @click="emit('edit', task)">Редагувати</button>
              <button class="btn btn--danger btn--sm" type="button" @click="emit('remove', task.id)">Видалити</button>
            </td>
          </tr>
        </template>
      </draggable>
    </table>

    <p v-if="!sortedItems.length" class="ptable__empty">Немає завдань за обраними фільтрами.</p>
  </div>
</template>

<style scoped lang="scss">
.ttable {
  &__hint {
    margin: 0;
    padding: 8px 14px;
    font-size: 12.5px;
    color: var(--color-muted);
    background: #fbfbfe;
    border-bottom: 1px solid var(--color-border);
  }

  &__label {
    font-weight: 600;
    color: var(--color-muted);
  }

  &__handle {
    text-align: center;
    color: var(--color-border-strong);
    cursor: grab;
    font-size: 16px;

    &:active {
      cursor: grabbing;
    }
  }

  &__row.sortable-ghost {
    opacity: 0.4;
    background: var(--color-primary-soft);
  }
}
</style>
