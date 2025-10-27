<script setup lang="ts">
  import { useProjects } from '@/store/projects';
  import { useLocalServers } from '@/views/project/hooks/servers';

  const { servers } = useLocalServers()
  const { projects } = useProjects()
  
</script>

<template>
  <div class="tour">
    <div v-if="servers?.length">
      Local Servers is Detected, Open DevTools to Generate Code.
    </div>
    <div v-else-if="projects.length">
      Projects are Configured, Start Projects & Open DevTools to Generate Code.
    </div>
    <div v-else>
      No Config Detected, See <ElLink
        underline="always"
        href="https://github.com/zdminjs/ara"
        target="_blank"
      >
        zdminjs/ara
      </ElLink> to Setup Local Projects.
    </div>
  </div>
</template>

<style scoped>
  .tour {
    --el-font-size-base: 14px;
    font-size: 14px;

    --el-link-font-weight: bold;
    font-weight: bold;

    padding: 18px 24px;
    color: #2c3e50;
  }
</style>