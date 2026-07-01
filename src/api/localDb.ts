import { ProjectStatus, TaskStatus, type Project, type Task } from '@/types'

const PROJECTS_KEY = 'ledger:projects'
const TASKS_KEY = 'ledger:tasks'
const SEED_FLAG_KEY = 'ledger:seeded'

function seedProjects(): Project[] {
  return [
    {
      id: 1,
      name: 'Redesign маркетингового сайту',
      description: 'Оновлення лендінгу та блогу компанії на новий дизайн.',
      status: ProjectStatus.Active,
      createdAt: '2026-05-12T09:00:00.000Z',
      taskCount: 4
    },
    {
      id: 2,
      name: 'Мобільний застосунок v2',
      description: 'Друга ітерація мобільного клієнта з offline-режимом.',
      status: ProjectStatus.Active,
      createdAt: '2026-06-01T09:00:00.000Z',
      taskCount: 3
    },
    {
      id: 3,
      name: 'Міграція на нову CI/CD',
      description: null,
      status: ProjectStatus.Archived,
      createdAt: '2026-03-20T09:00:00.000Z',
      taskCount: 0
    }
  ]
}

function seedTasks(): Task[] {
  return [
    { id: 1, projectId: 1, title: 'Зібрати макети в Figma', assignee: 'Олена К.', status: TaskStatus.Done, dueDate: '2026-06-10', order: 0 },
    { id: 2, projectId: 1, title: 'Верстка головної сторінки', assignee: 'Ігор П.', status: TaskStatus.InProgress, dueDate: '2026-07-05', order: 0 },
    { id: 3, projectId: 1, title: 'Інтеграція CMS', assignee: null, status: TaskStatus.Todo, dueDate: '2026-07-15', order: 0 },
    { id: 4, projectId: 1, title: 'SEO-аудит нових сторінок', assignee: 'Олена К.', status: TaskStatus.Todo, dueDate: '2026-07-20', order: 1 },
    { id: 5, projectId: 2, title: 'Офлайн-кеш даних', assignee: 'Марко С.', status: TaskStatus.InProgress, dueDate: '2026-07-08', order: 0 },
    { id: 6, projectId: 2, title: 'Push-нотифікації', assignee: null, status: TaskStatus.Todo, dueDate: '2026-07-22', order: 0 },
    { id: 7, projectId: 2, title: 'Тестування на Android 14', assignee: 'Марко С.', status: TaskStatus.Todo, dueDate: '2026-07-25', order: 1 }
  ]
}

function readRaw<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeRaw<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function ensureSeeded(): void {
  if (localStorage.getItem(SEED_FLAG_KEY)) return
  writeRaw(PROJECTS_KEY, seedProjects())
  writeRaw(TASKS_KEY, seedTasks())
  localStorage.setItem(SEED_FLAG_KEY, '1')
}

ensureSeeded()

export const localDb = {
  getProjects(): Project[] {
    return readRaw<Project[]>(PROJECTS_KEY, [])
  },
  saveProjects(projects: Project[]): void {
    writeRaw(PROJECTS_KEY, projects)
  },
  getTasks(): Task[] {
    return readRaw<Task[]>(TASKS_KEY, [])
  },
  saveTasks(tasks: Task[]): void {
    writeRaw(TASKS_KEY, tasks)
  },
  nextProjectId(): number {
    const projects = this.getProjects()
    return projects.length ? Math.max(...projects.map((p) => p.id)) + 1 : 1
  },
  nextTaskId(): number {
    const tasks = this.getTasks()
    return tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1
  },
  reset(): void {
    localStorage.removeItem(PROJECTS_KEY)
    localStorage.removeItem(TASKS_KEY)
    localStorage.removeItem(SEED_FLAG_KEY)
    ensureSeeded()
  }
}
