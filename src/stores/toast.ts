import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  kind: ToastKind
  text: string
}

let nextId = 1

export const useToastStore = defineStore('toast', () => {
  const messages = ref<ToastMessage[]>([])

  function push(text: string, kind: ToastKind = 'success'): void {
    const id = nextId++
    messages.value.push({ id, kind, text })
    setTimeout(() => dismiss(id), 3500)
  }

  function dismiss(id: number): void {
    messages.value = messages.value.filter((m) => m.id !== id)
  }

  return { messages, push, dismiss }
})
