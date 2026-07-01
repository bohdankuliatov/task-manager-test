<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import BaseModal from '@/components/common/BaseModal.vue'
import { projectFormSchema } from '@/utils/validation'
import type { CreateProjectPayload } from '@/types/project'

const emit = defineEmits<{ close: []; submit: [payload: CreateProjectPayload] }>()

const { defineField, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(projectFormSchema),
  initialValues: { name: '', description: '' }
})

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')

const onSubmit = handleSubmit((values) => {
  emit('submit', { name: values.name, description: values.description || null })
})
</script>

<template>
  <BaseModal title="Новий проект" @close="emit('close')">
    <form novalidate @submit="onSubmit">
      <div class="field">
        <label class="field__label" for="project-name">Назва проекту *</label>
        <input
          id="project-name"
          v-model="name"
          v-bind="nameAttrs"
          class="input"
          :class="{ 'input--invalid': errors.name }"
          type="text"
          placeholder="Напр. Redesign сайту"
        />
        <span class="field__error">{{ errors.name }}</span>
      </div>

      <div class="field">
        <label class="field__label" for="project-description">Опис проекту</label>
        <textarea
          id="project-description"
          v-model="description"
          v-bind="descriptionAttrs"
          class="textarea"
          :class="{ 'input--invalid': errors.description }"
          placeholder="Необов'язково"
        />
        <span class="field__error">{{ errors.description }}</span>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn--ghost" @click="emit('close')">Скасувати</button>
        <button type="submit" class="btn btn--primary" :disabled="isSubmitting">Зберегти проект</button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped lang="scss">
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
</style>
