<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>

<template>
  <div class="toast-stack">
    <TransitionGroup name="toast">
      <div v-for="toast in toastStore.messages" :key="toast.id" class="toast" :class="`toast--${toast.kind}`">
        <span>{{ toast.text }}</span>
        <button class="toast__close" type="button" aria-label="Закрити" @click="toastStore.dismiss(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
.toast-stack {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 200;
  width: min(340px, calc(100vw - 40px));
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-size: 13.5px;
  font-weight: 500;
  border-left: 3px solid var(--color-primary);
  background: var(--color-surface);
  color: var(--color-ink);

  &--success {
    border-left-color: var(--color-status-done);
  }

  &--error {
    border-left-color: var(--color-danger);
  }

  &__close {
    background: none;
    border: none;
    color: var(--color-muted);
    font-size: 16px;
    cursor: pointer;
    line-height: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
