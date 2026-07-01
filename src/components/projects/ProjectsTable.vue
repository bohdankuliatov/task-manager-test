<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useRouter } from 'vue-router'
import ProjectStatusBadge from './ProjectStatusBadge.vue'
import { useTableSort } from '@/composables/useTableSort'
import { useColumnResize } from '@/composables/useColumnResize'
import { formatDate } from '@/utils/date'
import type { Project, ProjectSortField } from '@/types/project'

const props = defineProps<{ projects: Project[] }>()
const emit = defineEmits<{ archive: [id: number]; remove: [id: number] }>()

const router = useRouter()
const projectsRef = toRef(props, 'projects')

const accessor = (project: Project, field: ProjectSortField): string | number => project[field]
const { sortField, sortDirection, toggleSort, sortedItems } = useTableSort<Project, ProjectSortField>(projectsRef, accessor)

const { widths, startResize } = useColumnResize({ id: 90, name: 320, taskCount: 140, status: 130, createdAt: 150 })

const columns: { id: ProjectSortField; label: string }[] = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Назва проекту' },
  { id: 'taskCount', label: 'Завдань' },
  { id: 'status', label: 'Статус' },
  { id: 'createdAt', label: 'Створено' }
]

const sortIndicator = computed(() => (field: ProjectSortField) => {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? '↑' : '↓'
})

function goToProject(id: number): void {
  router.push({ name: 'project-detail', params: { id } })
}
</script>

<template>
  <div class="table-wrap">
    <table class="ptable">
      <colgroup>
        <col v-for="col in columns" :key="col.id" :style="{ width: widths[col.id] + 'px' }" />
        <col style="width: 96px" />
      </colgroup>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.id">
            <button type="button" class="ptable__sort" @click="toggleSort(col.id)">
              {{ col.label }} <span class="ptable__sort-icon">{{ sortIndicator(col.id) }}</span>
            </button>
            <span class="ptable__resizer" @pointerdown="(e) => startResize(col.id, e)" />
          </th>
          <th class="ptable__actions-head">Дії</th>
        </tr>
      </thead>
      <TransitionGroup tag="tbody" name="list">
        <tr v-for="project in sortedItems" :key="project.id" class="ptable__row" @click="goToProject(project.id)">
          <td><span class="ledger-id">#{{ String(project.id).padStart(4, '0') }}</span></td>
          <td>
            <div class="ptable__name">{{ project.name }}</div>
            <div v-if="project.description" class="ptable__desc">{{ project.description }}</div>
          </td>
          <td>{{ project.taskCount }}</td>
          <td><ProjectStatusBadge :status="project.status" /></td>
          <td>{{ formatDate(project.createdAt) }}</td>
          <td class="ptable__actions" @click.stop>
            <button class="btn btn--ghost btn--sm" type="button" @click="emit('archive', project.id)">
              {{ project.status === 'active' ? 'Архівувати' : 'Активувати' }}
            </button>
            <button class="btn btn--danger btn--sm" type="button" @click="emit('remove', project.id)">Видалити</button>
          </td>
        </tr>
      </TransitionGroup>
    </table>

    <p v-if="!sortedItems.length" class="ptable__empty">Нічого не знайдено. Спробуйте змінити фільтри.</p>
  </div>
</template>

<style scoped lang="scss">
.table-wrap {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.ptable {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th {
    position: relative;
    text-align: left;
    padding: 12px 14px;
    font-size: 12.5px;
    color: var(--color-muted);
    border-bottom: 1px solid var(--color-border);
    user-select: none;
  }

  &__sort {
    background: none;
    border: none;
    font: inherit;
    font-weight: 600;
    color: var(--color-muted);
    cursor: pointer;
    padding: 0;

    &:hover {
      color: var(--color-ink);
    }
  }

  &__sort-icon {
    color: var(--color-primary);
  }

  &__resizer {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    cursor: col-resize;
    touch-action: none;
  }

  &__actions-head {
    width: 200px;
  }

  &__row {
    cursor: pointer;
    transition: background 0.12s ease;

    &:hover {
      background: var(--color-primary-soft);
    }

    td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--color-border);
      font-size: 14px;
      vertical-align: top;
    }
  }

  &__name {
    font-weight: 600;
  }

  &__desc {
    font-size: 12.5px;
    color: var(--color-muted);
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    gap: 6px;
    cursor: default;
  }

  &__empty {
    padding: 40px 20px;
    text-align: center;
    color: var(--color-muted);
    font-size: 14px;
  }
}
</style>
