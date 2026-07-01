import axios, { type AxiosRequestConfig } from 'axios'
import { mockAdapter } from './mockAdapter'

/**
 * Normalized error shape used across the whole app. Every function in the
 * api/* layer converts axios/mock errors into this shape so components and
 * stores never have to deal with AxiosError directly.
 */
export class AppError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.name = 'AppError'
    this.status = status
  }
}

const instance = axios.create({
  baseURL: '/api',
  adapter: mockAdapter,
  timeout: 5000
})

function toAppError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 500
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ?? error.message ?? 'Сталася невідома помилка мережі'
    return new AppError(message, status)
  }
  if (error instanceof Error) {
    return new AppError(error.message)
  }
  return new AppError('Сталася невідома помилка')
}

/**
 * Generic, minimal HTTP client. All request/response typing happens at the
 * call site, e.g. `api.get<Project[]>('/projects')`, keeping this layer
 * free of `any`.
 */
export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await instance.get<T>(url, config)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },
  async post<T, B = unknown>(url: string, body: B, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await instance.post<T>(url, body, config)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },
  async put<T, B = unknown>(url: string, body: B, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await instance.put<T>(url, body, config)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },
  async delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await instance.delete<T>(url, config)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  }
}
