<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import TasksTable from '@/components/tasks/TasksTable.vue'
import KanbanBoard from '@/components/tasks/KanbanBoard.vue'
import TaskFormModal from '@/components/tasks/TaskFormModal.vue'
import ProjectStatusBadge from '@/components/projects/ProjectStatusBadge.vue'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useToastStore } from '@/stores/toast'
import { usePersistedState } from '@/composables/usePersistedState'
import { TaskStatus, type Task } from '@/types/task'
import { TEAM_MEMBERS } from '@/utils/constants'

const props = defineProps<{ id: number }>()
const router = useRouter()

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const toastStore = useToastStore()

const viewMode = usePersistedState<'table' | 'kanban'>('ledger:project:viewMode', 'table')
const assigneeFilter = ref('all')
const statusFilter = ref<'all' | TaskStatus>('all')

const isModalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const modalDefaultStatus = ref<TaskStatus>(TaskStatus.Todo)

const project = computed(() => projectsStore.getById(props.id))

onMounted(async () => {
  if (!projectsStore.projects.length) {
    await projectsStore.fetchAll()
  }
  if (!project.value) {
    router.replace({ name: 'projects' })
    return
  }
  await tasksStore.fetchByProject(props.id)
})

const filteredTasks = computed(() =>
  tasksStore.tasks.filter((task) => {
    const matchesAssignee = assigneeFilter.value === 'all' || task.assignee === assigneeFilter.value
    const matchesStatus = statusFilter.value === 'all' || task.status === statusFilter.value
    return matchesAssignee && matchesStatus
  })
)

function openCreateModal(status: TaskStatus = TaskStatus.Todo): void {
  editingTask.value = null
  modalDefaultStatus.value = status
  isModalOpen.value = true
}

function openEditModal(task: Task): void {
  editingTask.value = task
  isModalOpen.value = true
}

async function handleSubmit(payload: { title: string; assignee: string | null; status: TaskStatus; dueDate: string }): Promise<void> {
  try {
    if (editingTask.value) {
      await tasksStore.updateTask(editingTask.value.id, payload)
      toastStore.push('Завдання оновлено')
    } else {
      await tasksStore.addTask({ ...payload, projectId: props.id })
      toastStore.push('Завдання успішно додано')
    }
    isModalOpen.value = false
  } catch {
    toastStore.push('Не вдалося зберегти завдання', 'error')
  }
}

async function handleRemove(id: number): Promise<void> {
  if (!confirm('Видалити це завдання?')) return
  try {
    await tasksStore.removeTask(id)
    toastStore.push('Завдання видалено')
  } catch {
    toastStore.push('Не вдалося видалити завдання', 'error')
  }
}
</script>

<template>
  <div v-if="project" class="container detail-view">
    <RouterLink to="/" class="detail-view__back">← Усі проекти</RouterLink>

    <div class="detail-view__header">
      <div>
        <h1>{{ project.name }}</h1>
        <p v-if="project.description" class="detail-view__desc">{{ project.description }}</p>
      </div>
      <ProjectStatusBadge :status="project.status" />
    </div>

    <div class="detail-view__toolbar">
      <div class="detail-view__filters">
        <select v-model="assigneeFilter" class="select">
          <option value="all">Усі виконавці</option>
          <option v-for="member in TEAM_MEMBERS" :key="member" :value="member">{{ member }}</option>
        </select>
        <select v-model="statusFilter" class="select">
          <option value="all">Усі статуси</option>
          <option value="todo">До виконання</option>
          <option value="in_progress">У роботі</option>
          <option value="done">Виконано</option>
        </select>
      </div>

      <div class="detail-view__actions">
        <div class="segmented">
          <button type="button" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">Таблиця</button>
          <button type="button" :class="{ active: viewMode === 'kanban' }" @click="viewMode = 'kanban'">Канбан</button>
        </div>
        <button class="btn btn--primary" type="button" @click="openCreateModal()">+ Додати завдання</button>
      </div>
    </div>

    <p v-if="tasksStore.error" class="detail-view__error">{{ tasksStore.error }}</p>
    <p v-else-if="tasksStore.isLoading" class="detail-view__loading">Завантаження завдань…</p>
    <template v-else>
      <TasksTable v-if="viewMode === 'table'" :tasks="filteredTasks" @edit="openEditModal" @remove="handleRemove" />
      <KanbanBoard
        v-else
        :tasks="filteredTasks"
        @edit="openEditModal"
        @remove="handleRemove"
        @add-task="openCreateModal"
      />
    </template>

    <TaskFormModal
      v-if="isModalOpen"
      :task="editingTask"
      :default-status="modalDefaultStatus"
      @close="isModalOpen = false"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 18px;

  &__back {
    font-size: 13px;
    color: var(--color-muted);
    text-decoration: none;
    width: fit-content;

    &:hover {
      color: var(--color-primary);
    }
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  &__desc {
    margin: 6px 0 0;
    color: var(--color-muted);
    font-size: 14px;
    max-width: 640px;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__filters {
    display: flex;
    gap: 10px;

    .select {
      width: 180px;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__error {
    color: var(--color-danger);
  }

  &__loading {
    color: var(--color-muted);
  }
}

.segmented {
  display: inline-flex;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  overflow: hidden;

  button {
    background: var(--color-surface);
    border: none;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-muted);
    cursor: pointer;

    &.active {
      background: var(--color-primary);
      color: white;
    }

    & + button {
      border-left: 1px solid var(--color-border-strong);
    }
  }
}
</style>
