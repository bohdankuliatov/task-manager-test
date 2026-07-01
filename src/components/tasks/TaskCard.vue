<script setup lang="ts">
import { formatDate } from '@/utils/date'
import type { Task } from '@/types/task'

defineProps<{ task: Task }>()
const emit = defineEmits<{ edit: []; remove: [] }>()
</script>

<template>
  <article class="tcard">
    <div class="tcard__top">
      <span class="ledger-id">#{{ String(task.id).padStart(4, '0') }}</span>
      <div class="tcard__menu">
        <button class="tcard__icon-btn" type="button" title="Редагувати" @click="emit('edit')">✎</button>
        <button class="tcard__icon-btn" type="button" title="Видалити" @click="emit('remove')">🗑</button>
      </div>
    </div>
    <p class="tcard__title">{{ task.title }}</p>
    <footer class="tcard__footer">
      <span class="tcard__assignee">{{ task.assignee ?? 'Без виконавця' }}</span>
      <span class="tcard__date">{{ formatDate(task.dueDate) }}</span>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.tcard {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px;
  cursor: grab;
  box-shadow: var(--shadow-sm);

  &:active {
    cursor: grabbing;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__menu {
    display: flex;
    gap: 4px;
  }

  &__icon-btn {
    background: none;
    border: none;
    color: var(--color-muted);
    cursor: pointer;
    font-size: 13px;
    padding: 2px 4px;
    border-radius: 4px;

    &:hover {
      color: var(--color-primary);
      background: var(--color-primary-soft);
    }
  }

  &__title {
    margin: 0 0 10px;
    font-size: 13.5px;
    font-weight: 500;
    line-height: 1.4;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--color-muted);
  }
}
</style>
