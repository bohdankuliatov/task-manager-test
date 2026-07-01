import { computed, ref, type Ref } from 'vue'
import type { SortDirection } from '@/types'

type Accessor<T, F extends string> = (item: T, field: F) => string | number

/**
 * Generic click-to-sort behaviour for any table. `accessor` maps a row +
 * field name to the primitive value that should be compared, so the same
 * composable drives both the projects table and the tasks table without
 * knowing their shapes.
 */
export function useTableSort<T, F extends string>(
  items: Ref<T[]>,
  accessor: Accessor<T, F>,
  initial?: { field: F | null; direction: SortDirection }
) {
  const sortField = ref<F | null>(initial?.field ?? null) as Ref<F | null>
  const sortDirection = ref<SortDirection>(initial?.direction ?? 'asc')

  function toggleSort(field: F): void {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }

  const sortedItems = computed<T[]>(() => {
    if (!sortField.value) return items.value
    const field = sortField.value
    const dir = sortDirection.value === 'asc' ? 1 : -1
    return [...items.value].sort((a, b) => {
      const av = accessor(a, field)
      const bv = accessor(b, field)
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
  })

  return { sortField, sortDirection, toggleSort, sortedItems }
}
