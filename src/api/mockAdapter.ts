import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosHeaders } from 'axios'
import { localDb } from './localDb'
import type { CreateProjectPayload, UpdateProjectPayload } from '@/types/project'
import { ProjectStatus } from '@/types/project'
import type { CreateTaskPayload, UpdateTaskPayload } from '@/types/task'

/**
 * ApiError carries an HTTP-like status so the service layer / stores can
 * branch on it the same way they would with a real backend.
 */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

function delay(): Promise<void> {
  const ms = 150 + Math.random() * 150 // 150–300ms
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function respond<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
    request: {}
  }
}

const PROJECTS_RE = /^\/projects\/?$/
const PROJECT_ITEM_RE = /^\/projects\/(\d+)\/?$/
const TASKS_RE = /^\/tasks\/?$/
const TASK_ITEM_RE = /^\/tasks\/(\d+)\/?$/

/**
 * Mock Axios adapter. Simulates a REST API backed by localStorage with a
 * realistic 150–300ms network delay. Kept isolated from the rest of the
 * codebase so a real backend can replace it by swapping `adapter` in
 * src/api/http.ts.
 */
export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  await delay()

  const method = (config.method ?? 'get').toLowerCase()
  const url = (config.url ?? '').split('?')[0]
  const params = config.params ?? {}

  try {
    // ---- Projects ----
    if (PROJECTS_RE.test(url) && method === 'get') {
      return respond(localDb.getProjects())
    }

    if (PROJECTS_RE.test(url) && method === 'post') {
      const payload = config.data ? (JSON.parse(config.data) as CreateProjectPayload) : ({} as CreateProjectPayload)
      const projects = localDb.getProjects()
      const project = {
        id: localDb.nextProjectId(),
        name: payload.name,
        description: payload.description ?? null,
        status: ProjectStatus.Active,
        createdAt: new Date().toISOString(),
        taskCount: 0
      }
      projects.push(project)
      localDb.saveProjects(projects)
      return respond(project, 201)
    }

    const projectItemMatch = url.match(PROJECT_ITEM_RE)
    if (projectItemMatch && method === 'put') {
      const id = Number(projectItemMatch[1])
      const payload = config.data ? (JSON.parse(config.data) as UpdateProjectPayload) : ({} as UpdateProjectPayload)
      const projects = localDb.getProjects()
      const idx = projects.findIndex((p) => p.id === id)
      if (idx === -1) throw new ApiError(`Project ${id} not found`, 404)
      projects[idx] = { ...projects[idx], ...payload }
      localDb.saveProjects(projects)
      return respond(projects[idx])
    }

    if (projectItemMatch && method === 'delete') {
      const id = Number(projectItemMatch[1])
      const projects = localDb.getProjects()
      const idx = projects.findIndex((p) => p.id === id)
      if (idx === -1) throw new ApiError(`Project ${id} not found`, 404)
      projects.splice(idx, 1)
      localDb.saveProjects(projects)
      // cascade delete tasks
      const tasks = localDb.getTasks().filter((t) => t.projectId !== id)
      localDb.saveTasks(tasks)
      return respond(null, 204)
    }

    // ---- Tasks ----
    if (TASKS_RE.test(url) && method === 'get') {
      const projectId = params.projectId != null ? Number(params.projectId) : null
      const tasks = localDb.getTasks()
      return respond(projectId != null ? tasks.filter((t) => t.projectId === projectId) : tasks)
    }

    if (TASKS_RE.test(url) && method === 'post') {
      const payload = config.data ? (JSON.parse(config.data) as CreateTaskPayload) : ({} as CreateTaskPayload)
      const tasks = localDb.getTasks()
      const siblingCount = tasks.filter((t) => t.projectId === payload.projectId && t.status === payload.status).length
      const task = {
        id: localDb.nextTaskId(),
        projectId: payload.projectId,
        title: payload.title,
        assignee: payload.assignee ?? null,
        status: payload.status,
        dueDate: payload.dueDate,
        order: siblingCount
      }
      tasks.push(task)
      localDb.saveTasks(tasks)

      // keep the project's cached task counter in sync
      const projects = localDb.getProjects()
      const project = projects.find((p) => p.id === payload.projectId)
      if (project) {
        project.taskCount += 1
        localDb.saveProjects(projects)
      }

      return respond(task, 201)
    }

    const taskItemMatch = url.match(TASK_ITEM_RE)
    if (taskItemMatch && method === 'put') {
      const id = Number(taskItemMatch[1])
      const payload = config.data ? (JSON.parse(config.data) as UpdateTaskPayload) : ({} as UpdateTaskPayload)
      const tasks = localDb.getTasks()
      const idx = tasks.findIndex((t) => t.id === id)
      if (idx === -1) throw new ApiError(`Task ${id} not found`, 404)
      tasks[idx] = { ...tasks[idx], ...payload }
      localDb.saveTasks(tasks)
      return respond(tasks[idx])
    }

    if (taskItemMatch && method === 'delete') {
      const id = Number(taskItemMatch[1])
      const tasks = localDb.getTasks()
      const idx = tasks.findIndex((t) => t.id === id)
      if (idx === -1) throw new ApiError(`Task ${id} not found`, 404)
      const [removed] = tasks.splice(idx, 1)
      localDb.saveTasks(tasks)

      const projects = localDb.getProjects()
      const project = projects.find((p) => p.id === removed.projectId)
      if (project) {
        project.taskCount = Math.max(0, project.taskCount - 1)
        localDb.saveProjects(projects)
      }

      return respond(null, 204)
    }

    throw new ApiError(`No mock handler for ${method.toUpperCase()} ${url}`, 404)
  } catch (err) {
    if (err instanceof ApiError) {
      const error = new Error(err.message) as Error & { response: AxiosResponse; isAxiosError: boolean }
      error.response = respond({ message: err.message }, err.status)
      error.isAxiosError = true
      throw error
    }
    throw err
  }
}
