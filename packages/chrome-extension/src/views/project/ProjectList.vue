<script setup lang="ts">
import { useProjects } from '@/store/projects';
import ProjectCreate from '@/views/project/ProjectCreate.vue';
import { Delete, Plus } from '@element-plus/icons-vue';
import { CrabFlex } from '@zdmin/crab';

const { projects, create, remove, clear } = useProjects()
</script>

<template>
  <CrabFlex
    direction="column"
    class="project-list"
    :main="{ class: 'flex flex-wrap' }"
  >
    <template #start>
      <CrabFlex class="project-list__toolbar px-1">
        <template #start>
          <BaseDrawer size="80%">
            <template #trigger="{ open }">
              <ElButton
                :icon="Plus"
                circle
                title="添加项目"
                size="large"
                text
                type="primary"
                @click="open"
              />
            </template>
            <template #default="{ close }">
              <ProjectCreate
                @create="v => {
                  create(v)
                  close()
                }"
              />
            </template>
          </BaseDrawer>
          <ElButton
            v-if="projects && projects.length"
            :icon="Delete"
            circle
            title="清空项目"
            size="large"
            text
            type="danger"
            @click="clear"
          />
        </template>
      </CrabFlex>
    </template>
    <template #main>
      <ElCard
        v-for="(project, i) in projects"
        :key="i"
        class="h-80 w-80 m-1"
        shadow="hover"
        @click="$router.push({ path: '/project-detail', query: { path: project.path } })"
      >
        <template #header>
          <CrabFlex>
            <template #default>
              {{ project.path }}
            </template>
            <template #end>
              <ElButton
                type="danger"
                plain
                round
                :icon="Delete"
                @click="remove(project)"
              />
            </template>
          </CrabFlex>
        </template>
        <div>文档</div>
        <ul class="w-full">
          <li
            v-for="doc of project?.docs"
            :key="doc.path"
            class="text-nowrap truncate"
            :title="doc.path"
          >
            <span v-if="doc.name">{{ doc.name }}：</span>{{ doc.path }}
          </li>
        </ul>
      </ElCard>
    </template>
  </CrabFlex>
</template>

<style lang="scss" scoped>
  .project-list {
    &__toolbar {
      border-bottom: 1px solid var(--color-divider);
    }
  }
</style>