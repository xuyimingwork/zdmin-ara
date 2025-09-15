<script setup lang="ts">
import { useProjects } from '@/store/projects';
import ProjectCreate from '@/views/project/ProjectCreate.vue';
import ProjectDetail from '@/views/project/ProjectDetail.vue';
import ProjectListItem from '@/views/project/ProjectListItem.vue';
import { Delete, Plus } from '@element-plus/icons-vue';
import { CrabFlex } from '@zdmin/crab';

const { projects, create, clear, remove } = useProjects()
const active = ref<typeof projects.value[0]>()
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
      <BaseDrawer
        size="80%"
        :with-header="false"
        body-class="p-0"
        style="--el-drawer-padding-primary: 0"
      >
        <template #trigger="{ open }">
          <ProjectListItem
            v-for="(project, i) in projects"
            :key="i"
            :path="project.path"
            :class="{ 
              active: active === project,
              'bg-(--el-color-primary-light-9)!': active === project 
            }"
            @click="() => {
              active = project
              open()
            }"
          />
        </template>
        <template #default="{ close }">
          <ProjectDetail
            v-if="active"
            :path="active?.path"
            @close="close"
            @remove="() => {
              remove(active)
              active = undefined
              close()
            }"
          />
        </template>
      </BaseDrawer>
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