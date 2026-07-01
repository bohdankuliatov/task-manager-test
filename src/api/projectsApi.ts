import { api } from './http'
import type { CreateProjectPayload, Project, UpdateProjectPayload } from '@/types/project'

export const projectsApi = {
  list(): Promise<Project[]> {
    return api.get<Project[]>('/projects')
  },
  create(payload: CreateProjectPayload): Promise<Project> {
    return api.post<Project, CreateProjectPayload>('/projects', payload)
  },
  update(id: number, payload: UpdateProjectPayload): Promise<Project> {
    return api.put<Project, UpdateProjectPayload>(`/projects/${id}`, payload)
  },
  remove(id: number): Promise<void> {
    return api.delete<void>(`/projects/${id}`)
  }
}
