<script setup lang="ts">
import { useStorage } from '@/hooks/storage';
import ProjectCreate from '@/views/project/ProjectCreate.vue';
import { Delete, Plus } from '@element-plus/icons-vue';
import { CrabFlex } from '@zdmin/crab';
import { isObjectLike } from 'es-toolkit/compat';



const {
  projects, queryProjectsLoading,
  updateProjects, updateProjectsLoading
} = useStorage('projects', [] as {
  path: string
  server: string
}[])

function update(projects: any[]) {
  return updateProjects(Array.isArray(projects) ? projects.filter(item => isObjectLike(item)) : [])
}

function create(v: any) {
  if (projects.value.find(item => item.path === v.path)) return update(projects.value.map(item => {
    if (item.path === v.path) return { ...item, ...v, updateTime: (new Date()).toISOString() }
    return item
  }))
  return update([{
    ...v,
    createTime: (new Date()).toISOString(),
    updateTime: (new Date()).toISOString(),
  }, ...projects.value])
}

function remove(v: any) {
  return update(projects.value.filter(item => item !== v))
}
</script>

<template>
  <CrabFlex
    direction="column"
    class="p-3 gap-2"
    :main="{ class: 'flex flex-wrap' }"
  >
    <template #start>
      <CrabFlex>
        <template #end>
          <BaseDrawer size="80%">
            <template #trigger="{ open }">
              <ElButton
                :icon="Plus"
                type="primary"
                @click="open"
              >
                添加项目
              </ElButton>
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
      </CrabFlex>
    </template>
    <template #main>
      <ElCard
        v-for="(project, i) in projects"
        :key="i"
        class="h-80 w-80"
        shadow="hover"
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
      </ElCard>
    </template>
  </CrabFlex>
</template>

<style lang="scss" scoped>

</style>