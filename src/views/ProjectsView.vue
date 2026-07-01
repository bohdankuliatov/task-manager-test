<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ProjectsTable from '@/components/projects/ProjectsTable.vue'
import ProjectFormModal from '@/components/projects/ProjectFormModal.vue'
import StatsChart from '@/components/common/StatsChart.vue'
import { useProjectsStore } from '@/stores/projects'
import { useToastStore } from '@/stores/toast'
import { usePersistedState } from '@/composables/usePersistedState'
import { tasksApi } from '@/api/tasksApi'
import { TaskStatus } from '@/types/task'
import { ProjectStatus, type CreateProjectPayload } from '@/types/project'

const projectsStore = useProjectsStore()
const toastStore = useToastStore()

const searchQuery = usePersistedState('ledger:projects:search', '')
const statusFilter = usePersistedState<'all' | ProjectStatus>('ledger:projects:status', 'all')
const isModalOpen = ref(false)
const statusCounts = ref({ todo: 0, inProgress: 0, done: 0 })

onMounted(async () => {
  await projectsStore.fetchAll()
  const allTasks = await tasksApi.listAll()
  statusCounts.value = {
    todo: allTasks.filter((t) => t.status === TaskStatus.Todo).length,
    inProgress: allTasks.filter((t) => t.status === TaskStatus.InProgress).length,
    done: allTasks.filter((t) => t.status === TaskStatus.Done).length
  }
})

const filteredProjects = computed(() =>
  projectsStore.projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.value.trim().toLowerCase())
    const matchesStatus = statusFilter.value === 'all' || project.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
)

async function handleCreate(payload: CreateProjectPayload): Promise<void> {
  try {
    await projectsStore.addProject(payload)
    isModalOpen.value = false
    toastStore.push('Проект успішно додано')
  } catch {
    toastStore.push('Не вдалося створити проект', 'error')
  }
}

async function handleArchive(id: number): Promise<void> {
  try {
    await projectsStore.toggleArchive(id)
    toastStore.push('Статус проекту оновлено')
  } catch {
    toastStore.push('Не вдалося оновити статус', 'error')
  }
}

async function handleRemove(id: number): Promise<void> {
  if (!confirm('Видалити проект разом з усіма завданнями?')) return
  try {
    await projectsStore.removeProject(id)
    toastStore.push('Проект видалено')
  } catch {
    toastStore.push('Не вдалося видалити проект', 'error')
  }
}
</script>

<template>
  <div class="container projects-view">
    <div class="projects-view__intro">
      <h1>Проекти</h1>
      <p class="projects-view__subtitle">Огляд усіх проектів та їхнього прогресу.</p>
    </div>

    <StatsChart :todo="statusCounts.todo" :in-progress="statusCounts.inProgress" :done="statusCounts.done" />

    <div class="projects-view__toolbar">
      <div class="projects-view__filters">
        <input v-model="searchQuery" class="input" type="search" placeholder="Пошук за назвою..." />
        <select v-model="statusFilter" class="select">
          <option value="all">Усі статуси</option>
          <option value="active">Активні</option>
          <option value="archived">Архівні</option>
        </select>
      </div>
      <button class="btn btn--primary" type="button" @click="isModalOpen = true">+ Додати проект</button>
    </div>

    <p v-if="projectsStore.error" class="projects-view__error">{{ projectsStore.error }}</p>
    <p v-else-if="projectsStore.isLoading" class="projects-view__loading">Завантаження проектів…</p>
    <ProjectsTable v-else :projects="filteredProjects" @archive="handleArchive" @remove="handleRemove" />

    <ProjectFormModal v-if="isModalOpen" @close="isModalOpen = false" @submit="handleCreate" />
  </div>
</template>

<style scoped lang="scss">
.projects-view {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__intro {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__subtitle {
    margin: 0;
    color: var(--color-muted);
    font-size: 14px;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__filters {
    display: flex;
    gap: 10px;

    .input {
      width: 260px;
    }
    .select {
      width: 160px;
    }
  }

  &__error {
    color: var(--color-danger);
  }

  &__loading {
    color: var(--color-muted);
  }
}
</style>
