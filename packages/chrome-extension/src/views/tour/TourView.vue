<script setup lang="ts">
  import { useProjects } from '@/store/projects';
import { i18n } from '@/utils/i18n';
  import { useLocalServers } from '@/views/project/hooks/servers';

  const { servers } = useLocalServers()
  const { projects } = useProjects()
  
</script>

<template>
  <div class="tour">
    <div v-if="servers?.length">
      {{ i18n('tourLocalServersDetected') }}
    </div>
    <div v-else-if="projects.length">
      {{ i18n('tourLocalProjectsConfigured') }}
    </div>
    <div v-else>
      {{ i18n('tourNoConfigDetected') }} <ElLink
        underline="always"
        href="https://github.com/zdminjs/ara"
        target="_blank"
      >
        zdminjs/ara
      </ElLink>
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