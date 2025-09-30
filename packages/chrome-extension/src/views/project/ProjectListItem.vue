<script setup lang="ts">
  import BaseItem from '@/views/project/components/BaseItem.vue';
  import { useProject, useProjectConnected } from '@/views/project/hooks/project';

  const props = defineProps<{
    path: string
  }>()

  const parent = computed(() => props.path.substring(0, props.path.lastIndexOf('/')))
  const name = computed(() => props.path.substring(props.path.lastIndexOf('/') + 1))
  const { project } = useProject(() => props.path)
  const connected = useProjectConnected(() => props.path)
</script>

<template>
  <BaseItem
    class="project-list-item"
    :status-pulse="connected"
    :status="connected ? 'success' : 'info'"
    :status-title="connected ? `已连接：${project?.server}` : '未连接'"
    :title="name"
    :subtitle="parent"
  />
</template>
