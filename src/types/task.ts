export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done'
}

export interface Task {
  id: number
  projectId: number
  title: string
  assignee: string | null
  status: TaskStatus
  dueDate: string // ISO date string (yyyy-mm-dd)
  order: number // position within its status column
}

export interface CreateTaskPayload {
  projectId: number
  title: string
  assignee?: string | null
  status: TaskStatus
  dueDate: string
}

export interface UpdateTaskPayload {
  title?: string
  assignee?: string | null
  status?: TaskStatus
  dueDate?: string
  order?: number
}

export type TaskSortField = 'dueDate' | 'status' | 'title'
