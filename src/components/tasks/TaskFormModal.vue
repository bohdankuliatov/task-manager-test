<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import BaseModal from '@/components/common/BaseModal.vue'
import { taskFormSchema } from '@/utils/validation'
import { TEAM_MEMBERS } from '@/utils/constants'
import { TaskStatus, type Task } from '@/types/task'
import { todayIso } from '@/utils/date'

const props = defineProps<{ task?: Task | null; defaultStatus?: TaskStatus }>()
const emit = defineEmits<{
  close: []
  submit: [payload: { title: string; assignee: string | null; status: TaskStatus; dueDate: string }]
}>()

const { defineField, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(taskFormSchema),
  initialValues: {
    title: props.task?.title ?? '',
    assignee: props.task?.assignee ?? '',
    status: props.task?.status ?? props.defaultStatus ?? TaskStatus.Todo,
    dueDate: props.task?.dueDate ?? todayIso()
  }
})

const [title, titleAttrs] = defineField('title')
const [assignee, assigneeAttrs] = defineField('assignee')
const [status, statusAttrs] = defineField('status')
const [dueDate, dueDateAttrs] = defineField('dueDate')

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'До виконання',
  [TaskStatus.InProgress]: 'У роботі',
  [TaskStatus.Done]: 'Виконано'
}

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    title: values.title,
    assignee: values.assignee || null,
    status: values.status,
    dueDate: values.dueDate
  })
})
</script>

<template>
  <BaseModal :title="task ? 'Редагувати завдання' : 'Нове завдання'" @close="emit('close')">
    <form novalidate @submit="onSubmit">
      <div class="field">
        <label class="field__label" for="task-title">Назва завдання *</label>
        <input
          id="task-title"
          v-model="title"
          v-bind="titleAttrs"
          class="input"
          :class="{ 'input--invalid': errors.title }"
          type="text"
          placeholder="Напр. Верстка головної сторінки"
        />
        <span class="field__error">{{ errors.title }}</span>
      </div>

      <div class="field">
        <label class="field__label" for="task-assignee">Виконавець</label>
        <select id="task-assignee" v-model="assignee" v-bind="assigneeAttrs" class="select">
          <option value="">Без виконавця</option>
          <option v-for="member in TEAM_MEMBERS" :key="member" :value="member">{{ member }}</option>
        </select>
      </div>

      <div class="field-row">
        <div class="field">
          <label class="field__label" for="task-status">Статус *</label>
          <select
            id="task-status"
            v-model="status"
            v-bind="statusAttrs"
            class="select"
            :class="{ 'input--invalid': errors.status }"
          >
            <option v-for="(label, value) in statusLabels" :key="value" :value="value">{{ label }}</option>
          </select>
          <span class="field__error">{{ errors.status }}</span>
        </div>

        <div class="field">
          <label class="field__label" for="task-due-date">Термін виконання *</label>
          <input
            id="task-due-date"
            v-model="dueDate"
            v-bind="dueDateAttrs"
            class="input"
            :class="{ 'input--invalid': errors.dueDate }"
            type="date"
          />
          <span class="field__error">{{ errors.dueDate }}</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn--ghost" @click="emit('close')">Скасувати</button>
        <button type="submit" class="btn btn--primary" :disabled="isSubmitting">Зберегти завдання</button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped lang="scss">
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
</style>
