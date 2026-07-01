import { onBeforeUnmount, reactive } from 'vue'

const MIN_WIDTH = 60

/**
 * Lets a table drag its header column borders to resize columns. Widths are
 * kept in a reactive map keyed by column id and applied as inline
 * `width` styles by the consuming component.
 */
export function useColumnResize(initialWidths: Record<string, number>) {
  const widths = reactive<Record<string, number>>({ ...initialWidths })

  let activeColumn: string | null = null
  let startX = 0
  let startWidth = 0

  function onPointerMove(event: PointerEvent): void {
    if (!activeColumn) return
    const delta = event.clientX - startX
    widths[activeColumn] = Math.max(MIN_WIDTH, startWidth + delta)
  }

  function onPointerUp(): void {
    activeColumn = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  function startResize(columnId: string, event: PointerEvent): void {
    activeColumn = columnId
    startX = event.clientX
    startWidth = widths[columnId] ?? 150
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  })

  return { widths, startResize }
}
