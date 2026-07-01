<script setup lang="ts">
import { ProjectStatus } from '@/types/project'

const props = defineProps<{ status: ProjectStatus }>()

const labels: Record<ProjectStatus, string> = {
  [ProjectStatus.Active]: 'Активний',
  [ProjectStatus.Archived]: 'Архів'
}
</script>

<template>
  <span class="chip" :class="`chip--${props.status}`">{{ labels[props.status] }}</span>
</template>
