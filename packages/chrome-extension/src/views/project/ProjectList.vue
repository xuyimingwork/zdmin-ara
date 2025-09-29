<script setup lang="ts">
import { useProjects } from '@/store/projects';
import { useLocalServers } from '@/views/project/hooks/servers';
import ProjectCreate from '@/views/project/ProjectCreate.vue';
import ProjectListPure from '@/views/project/ProjectListPure.vue';
import { Delete, Plus, Refresh } from '@element-plus/icons-vue';
import { CrabFlex } from '@zdmin/crab';

const { projects, create, clear } = useProjects()
const active = ref<typeof projects.value[0]>()
const { free: freeProjects, refresh, refreshLoading } = useLocalServers()
</script>

<template>
  <CrabFlex
    direction="column"
    class="project-list"
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
            :icon="Refresh"
            circle
            title="刷新"
            size="large"
            :loading="refreshLoading"
            text
            @click="refresh"
          />
        </template>
        <template #end>
          <ElButton
            v-if="projects && projects.length"
            :icon="Delete"
            circle
            title="删除全部项目"
            size="large"
            text
            disabled
            type="danger"
            @click="clear"
          />
        </template>
      </CrabFlex>
    </template>
    <template #main>
      <ProjectListPure 
        key="used"
        :active="active"
        :projects="projects"
        @click-item="project => {
          $router.push({ 
            name: 'project-detail', 
            query: { path: project.path }
          })
        }"
      />
      <ProjectListPure 
        key="free"
        :active="active"
        :projects="freeProjects" 
        @click-item="project => {
          create(project)
          $router.push({ 
            name: 'project-detail', 
            query: { path: project.path }
          })
        }"
      />
      <ElEmpty
        v-if="(!projects || !projects.length) && (!freeProjects || !freeProjects.length)"
        description="未发现项目"
      />
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