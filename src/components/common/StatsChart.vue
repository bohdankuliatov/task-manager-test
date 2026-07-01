<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ todo: number; inProgress: number; done: number }>()

const total = computed(() => Math.max(1, props.todo + props.inProgress + props.done))

const bars = computed(() => [
  { label: 'До виконання', value: props.todo, modifier: 'todo' },
  { label: 'У роботі', value: props.inProgress, modifier: 'in_progress' },
  { label: 'Виконано', value: props.done, modifier: 'done' }
])
</script>

<template>
  <div class="stats-chart">
    <div class="stats-chart__header">
      <h3>Розподіл завдань за статусами</h3>
      <span class="stats-chart__total">{{ total === 1 && todo + inProgress + done === 0 ? 0 : todo + inProgress + done }} завдань усього</span>
    </div>
    <div class="stats-chart__bars">
      <div v-for="bar in bars" :key="bar.modifier" class="stats-chart__row">
        <span class="stats-chart__label">{{ bar.label }}</span>
        <div class="stats-chart__track">
          <div
            class="stats-chart__fill"
            :class="`stats-chart__fill--${bar.modifier}`"
            :style="{ width: (bar.value / total) * 100 + '%' }"
          />
        </div>
        <span class="stats-chart__value ledger-id">{{ bar.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stats-chart {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px 22px;

  &__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 16px;

    h3 {
      font-size: 15px;
    }
  }

  &__total {
    font-size: 12.5px;
    color: var(--color-muted);
  }

  &__row {
    display: grid;
    grid-template-columns: 120px 1fr 28px;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__label {
    font-size: 13px;
    color: var(--color-ink-soft);
  }

  &__track {
    height: 8px;
    border-radius: 999px;
    background: #eeeef4;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease;

    &--todo {
      background: var(--color-status-todo);
    }
    &--in_progress {
      background: var(--color-status-progress);
    }
    &--done {
      background: var(--color-status-done);
    }
  }

  &__value {
    text-align: right;
  }
}
</style>
