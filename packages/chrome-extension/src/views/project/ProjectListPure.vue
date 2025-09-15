<script setup lang="ts">
  import ProjectListItem from '@/views/project/ProjectListItem.vue';

  defineProps<{
    active?: any
    projects?: Array<any>
  }>()

  defineEmits<{
    'click-item': [project: any]
  }>()
</script>

<template>
  <ProjectListItem
    v-for="project in projects"
    :key="project.path"
    :path="project.path"
    :class="{ 
      active: active?.path === project?.path,
      'bg-(--el-color-primary-light-9)!': active?.path === project?.path
    }"
    @click="() => $emit('click-item', project)"
  />
</template>