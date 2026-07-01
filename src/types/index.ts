export * from './project'
export * from './task'

export type SortDirection = 'asc' | 'desc'

export interface SortState<T extends string> {
  field: T | null
  direction: SortDirection
}
