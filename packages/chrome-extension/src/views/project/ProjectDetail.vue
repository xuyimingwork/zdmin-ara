<script setup lang="ts">
  import { useProjects } from '@/store/projects';

  const props = defineProps<{
    path: string
  }>()

  const { query } = useProjects()
  const project = computed(() => query(props.path))
</script>

<template>
  <div>
    {{ project }}
  </div>
</template>