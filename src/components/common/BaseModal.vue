<script setup lang="ts">
withDefaults(defineProps<{ title: string; width?: string }>(), { width: '480px' })
const emit = defineEmits<{ close: [] }>()

function onOverlayClick(): void {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="modal-overlay" @mousedown.self="onOverlayClick">
        <div class="modal" :style="{ maxWidth: width }" role="dialog" aria-modal="true">
          <header class="modal__header">
            <h2>{{ title }}</h2>
            <button class="modal__close" type="button" aria-label="Закрити" @click="emit('close')">×</button>
          </header>
          <div class="modal__body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(27, 27, 47, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 150;
  padding: 20px;
}

.modal {
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: min(640px, 90vh);
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 22px;
    border-bottom: 1px solid var(--color-border);
  }

  &__close {
    background: none;
    border: none;
    font-size: 20px;
    line-height: 1;
    color: var(--color-muted);
    cursor: pointer;

    &:hover {
      color: var(--color-ink);
    }
  }

  &__body {
    padding: 22px;
    overflow-y: auto;
  }
}
</style>
