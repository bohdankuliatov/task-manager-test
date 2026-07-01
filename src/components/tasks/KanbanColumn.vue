<script setup lang="ts">
import draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'
import type { Task, TaskStatus } from '@/types/task'

const props = defineProps<{ title: string; status: TaskStatus; tasks: Task[]; accent: string }>()
const emit = defineEmits<{
  'update:tasks': [tasks: Task[]]
  change: [event: unknown]
  edit: [task: Task]
  remove: [id: number]
  'add-task': [status: TaskStatus]
}>()

function onUpdate(list: Task[]): void {
  emit('update:tasks', list)
}
</script>

<template>
  <div class="kcolumn" :style="{ '--accent': accent }">
    <header class="kcolumn__header">
      <h3>{{ props.title }}</h3>
      <span class="kcolumn__count">{{ props.tasks.length }}</span>
    </header>

    <draggable
      class="kcolumn__list"
      :model-value="props.tasks"
      item-key="id"
      group="tasks"
      ghost-class="kcolumn__ghost"
      drag-class="kcolumn__dragging"
      @update:model-value="onUpdate"
      @change="emit('change', $event)"
    >
      <template #item="{ element: task }">
        <TaskCard :task="task" @edit="emit('edit', task)" @remove="emit('remove', task.id)" />
      </template>
    </draggable>

    <button class="kcolumn__add" type="button" @click="emit('add-task', props.status)">+ Додати завдання</button>
  </div>
</template>

<style scoped lang="scss">
.kcolumn {
  background: #fbfbfe;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px;
  display: flex;
  flex-direction: column;
  min-height: 200px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-left: 8px;
    border-left: 3px solid var(--accent);

    h3 {
      font-size: 14px;
    }
  }

  &__count {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-muted);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 60px;
    flex: 1;
  }

  &__ghost {
    opacity: 0.5;
  }

  &__dragging {
    box-shadow: var(--shadow-md);
  }

  &__add {
    margin-top: 12px;
    background: none;
    border: 1px dashed var(--color-border-strong);
    border-radius: var(--radius-sm);
    padding: 8px;
    font-size: 13px;
    color: var(--color-muted);
    cursor: pointer;

    &:hover {
      color: var(--color-primary);
      border-color: var(--color-primary);
    }
  }
}
</style>
