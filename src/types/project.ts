export enum ProjectStatus {
  Active = 'active',
  Archived = 'archived'
}

export interface Project {
  id: number
  name: string
  description: string | null
  status: ProjectStatus
  createdAt: string // ISO date string
  taskCount: number
}

export interface CreateProjectPayload {
  name: string
  description?: string | null
}

export interface UpdateProjectPayload {
  name?: string
  description?: string | null
  status?: ProjectStatus
}

export type ProjectSortField = 'id' | 'name' | 'taskCount' | 'status' | 'createdAt'
