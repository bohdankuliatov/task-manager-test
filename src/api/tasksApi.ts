import { api } from './http'
import type { CreateTaskPayload, Task, UpdateTaskPayload } from '@/types/task'

export const tasksApi = {
  listByProject(projectId: number): Promise<Task[]> {
    return api.get<Task[]>('/tasks', { params: { projectId } })
  },
  listAll(): Promise<Task[]> {
    return api.get<Task[]>('/tasks')
  },
  create(payload: CreateTaskPayload): Promise<Task> {
    return api.post<Task, CreateTaskPayload>('/tasks', payload)
  },
  update(id: number, payload: UpdateTaskPayload): Promise<Task> {
    return api.put<Task, UpdateTaskPayload>(`/tasks/${id}`, payload)
  },
  remove(id: number): Promise<void> {
    return api.delete<void>(`/tasks/${id}`)
  }
}
