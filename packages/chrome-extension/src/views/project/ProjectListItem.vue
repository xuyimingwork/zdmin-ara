<script setup lang="ts">
  import { useProject } from '@/views/project/hooks/project';
  import { useServerConnected } from '@/views/project/hooks/servers';

  const props = defineProps<{
    path: string
  }>()

  const parent = computed(() => props.path.substring(0, props.path.lastIndexOf('/')))
  const name = computed(() => props.path.substring(props.path.lastIndexOf('/') + 1))
  const { project } = useProject(() => props.path)

  const connected = useServerConnected(() => project.value?.server)
</script>

<template>
  <div class="project-list-item p-1 cursor-pointer">
    <span
      class="size-[9px] rounded-full inline-block mr-1"
      :class="{
        'animate-pulse': connected,
        'bg-(--el-color-success)': connected,
        'bg-(--el-color-info)': !connected
      }"
      :title="connected ? `已连接：${project?.server}` : '未连接'"
    />
    <span class="text-(--el-text-color-primary) font-medium">{{ name }}</span>
    <span class="ml-1 text-(--el-text-color-regular)">{{ parent }}</span>
  </div>
</template>

<style lang="scss" scoped>
  .project-list-item {
    &:hover {
      background-color: color-mix(in srgb, #1f1f1fff 6%, transparent);
    }
  }
</style>