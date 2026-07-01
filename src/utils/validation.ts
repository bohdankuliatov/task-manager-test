import { z } from 'zod'
import { TaskStatus } from '@/types/task'

function startOfToday(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

export const projectFormSchema = z.object({
  name: z
    .string({ required_error: 'Поле обов’язкове' })
    .trim()
    .min(2, 'Від 2 до 100 символів')
    .max(100, 'Від 2 до 100 символів'),
  description: z.string().trim().max(1000, 'Опис занадто довгий').optional().or(z.literal(''))
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export const taskFormSchema = z.object({
  title: z
    .string({ required_error: 'Поле обов’язкове' })
    .trim()
    .min(3, 'Від 3 до 120 символів')
    .max(120, 'Від 3 до 120 символів'),
  assignee: z.string().trim().max(120).optional().or(z.literal('')),
  status: z.nativeEnum(TaskStatus, { required_error: 'Оберіть статус' }),
  dueDate: z
    .string({ required_error: 'Дата не може бути в минулому' })
    .min(1, 'Дата не може бути в минулому')
    .refine((value) => {
      const date = new Date(value)
      return date.getTime() >= startOfToday().getTime()
    }, 'Дата не може бути в минулому')
})

export type TaskFormValues = z.infer<typeof taskFormSchema>
