import { defineStore } from 'pinia'
import { ref } from 'vue'
import { projectsApi } from '@/api/projectsApi'
import { AppError } from '@/api/http'
import { ProjectStatus, type CreateProjectPayload, type Project } from '@/types/project'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      projects.value = await projectsApi.list()
    } catch (err) {
      error.value = err instanceof AppError ? err.message : 'Не вдалося завантажити проекти'
    } finally {
      isLoading.value = false
    }
  }

  async function addProject(payload: CreateProjectPayload): Promise<Project> {
    const project = await projectsApi.create(payload)
    projects.value = [...projects.value, project]
    return project
  }

  async function toggleArchive(id: number): Promise<void> {
    const target = projects.value.find((p) => p.id === id)
    if (!target) return
    const nextStatus = target.status === ProjectStatus.Active ? ProjectStatus.Archived : ProjectStatus.Active
    const updated = await projectsApi.update(id, { status: nextStatus })
    projects.value = projects.value.map((p) => (p.id === id ? updated : p))
  }

  async function removeProject(id: number): Promise<void> {
    await projectsApi.remove(id)
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  function bumpTaskCount(projectId: number, delta: number): void {
    const target = projects.value.find((p) => p.id === projectId)
    if (target) target.taskCount = Math.max(0, target.taskCount + delta)
  }

  function getById(id: number): Project | undefined {
    return projects.value.find((p) => p.id === id)
  }

  return {
    projects,
    isLoading,
    error,
    fetchAll,
    addProject,
    toggleArchive,
    removeProject,
    bumpTaskCount,
    getById
  }
})
