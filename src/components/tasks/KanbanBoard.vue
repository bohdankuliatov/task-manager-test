<script setup lang="ts">
import { reactive, watch } from 'vue'
import KanbanColumn from './KanbanColumn.vue'
import { useTaskDrag } from '@/composables/useTaskDrag'
import { TaskStatus, type Task } from '@/types/task'

const props = defineProps<{ tasks: Task[] }>()
const emit = defineEmits<{ edit: [task: Task]; remove: [id: number]; 'add-task': [status: TaskStatus] }>()

const { onKanbanChange } = useTaskDrag()

const columns = reactive<Record<TaskStatus, Task[]>>({
  [TaskStatus.Todo]: [],
  [TaskStatus.InProgress]: [],
  [TaskStatus.Done]: []
})

function syncColumns(tasks: Task[]): void {
  const grouped: Record<TaskStatus, Task[]> = {
    [TaskStatus.Todo]: [],
    [TaskStatus.InProgress]: [],
    [TaskStatus.Done]: []
  }
  for (const task of tasks) grouped[task.status].push(task)
  for (const status of Object.keys(grouped) as TaskStatus[]) {
    grouped[status].sort((a, b) => a.order - b.order)
    columns[status] = grouped[status]
  }
}

watch(() => props.tasks, syncColumns, { immediate: true, deep: true })

const definitions: { status: TaskStatus; title: string; accent: string }[] = [
  { status: TaskStatus.Todo, title: 'To Do', accent: 'var(--color-status-todo)' },
  { status: TaskStatus.InProgress, title: 'In Progress', accent: 'var(--color-status-progress)' },
  { status: TaskStatus.Done, title: 'Done', accent: 'var(--color-status-done)' }
]
</script>

<template>
  <div class="kboard">
    <KanbanColumn
      v-for="def in definitions"
      :key="def.status"
      :title="def.title"
      :status="def.status"
      :tasks="columns[def.status]"
      :accent="def.accent"
      @update:tasks="(list) => (columns[def.status] = list)"
      @change="(event) => onKanbanChange(def.status, event as never)"
      @edit="(task) => emit('edit', task)"
      @remove="(id) => emit('remove', id)"
      @add-task="(status) => emit('add-task', status)"
    />
  </div>
</template>

<style scoped lang="scss">
.kboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
}
</style>
