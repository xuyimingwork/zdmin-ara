<script setup lang="ts">
  import { Close, Delete, HomeFilled } from '@element-plus/icons-vue';
  import { CrabFlex } from '@zdmin/crab';
  import { useProject } from '@/views/project/hooks/project';
  import ProjectListItem from '@/views/project/ProjectListItem.vue';
  import BaseItem from '@/views/project/components/BaseItem.vue';
  import ProjectDocDetail from '@/views/project/ProjectDocDetail.vue';

  const props = defineProps<{
    path: string
  }>()

  defineEmits<{
    close: []
    remove: []
  }>()

  const { project } = useProject(() => props.path)
  const route = useRoute()
  const activeDoc = ref()
</script>

<template>
  <CrabFlex
    class="project-detail"
    direction="column"
  >
    <template #start>
      <CrabFlex class="project-detail__toolbar items-center">
        <template #start>
          <ElButton
            v-if="route.name === 'project-detail'"
            :icon="HomeFilled"
            circle
            title="项目页"
            size="large"
            text
            @click="$router.push('/project')"
          />
          <ElButton
            v-else
            :icon="Close"
            circle
            title="关闭"
            size="large"
            text
            @click="$emit('close')"
          />
          <ElDivider
            direction="vertical"
            class="ml-0!"
          />
        </template>
        <template #default>
          <ProjectListItem
            :path="path"
            no-hover
          />
        </template>
        <template #end>
          <ElButton
            :icon="Delete"
            circle
            title="删除项目"
            size="large"
            type="danger"
            text
            @click="$emit('remove')"
          />
        </template>
      </CrabFlex>
    </template>
    <CrabFlex 
      style="height: 100%;"
      :start="{ style: `width: ${activeDoc ? '200px' : '100%'}` }"
      :main="{ style: 'border-left: 1px solid var(--color-divider); height: 100%; overflow-y: auto;' }"
    >
      <template #start>
        <BaseItem
          v-for="doc of project?.docs"
          :key="doc.name"
          :title="doc.name"
          :subtitle="doc.url"
          :class="{ 
            active: activeDoc?.url === doc?.url,
            'bg-(--el-color-primary-light-9)!': activeDoc?.url === doc.url,
          }"
          @click="activeDoc = doc"
        />
      </template>
      <template
        v-if="activeDoc"
        #default
      >
        <ProjectDocDetail
          :path="path"
          :doc="activeDoc"
        />
      </template>
    </CrabFlex>
    <template
      v-if="project?.docs"
      #end
    >
      <CrabFlex class="project-detail__statusbar items-center">
        <span v-if="project?.docs?.length">{{ project?.docs?.length }}份文档</span>
      </CrabFlex>
    </template>
  </CrabFlex>
</template>

<style lang="scss" scoped>
  .project-detail {
    &__toolbar {
      border-bottom: 1px solid var(--color-divider);
      min-height: 26px;
    }
    &__statusbar {
      border-top: 1px solid var(--color-divider);
      min-height: 26px;
    }
  }
    
  .el-collapse-item {
    :deep(.el-collapse-item__title) {
      overflow: hidden;
    }
  }
</style>