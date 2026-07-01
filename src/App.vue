<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="container app-header__inner">
        <RouterLink to="/" class="app-header__brand">
          <span class="app-header__mark">Ledger</span>
          <span class="app-header__tag">управління проектами</span>
        </RouterLink>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <ToastContainer />
  </div>
</template>

<style lang="scss">
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);

  &__inner {
    display: flex;
    align-items: center;
    height: 64px;
  }

  &__brand {
    display: flex;
    align-items: baseline;
    gap: 10px;
    text-decoration: none;
  }

  &__mark {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 20px;
    color: var(--color-ink);
  }

  &__tag {
    font-size: 13px;
    color: var(--color-muted);
  }
}

.app-main {
  flex: 1;
  padding: 32px 0 64px;
}
</style>
