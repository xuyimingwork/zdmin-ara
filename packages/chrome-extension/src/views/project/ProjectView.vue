<script setup lang="ts">
import { useProjects } from '@/store/projects';
import ProjectCreate from '@/views/project/ProjectCreate.vue';
import { Delete, Plus } from '@element-plus/icons-vue';
import { CrabFlex } from '@zdmin/crab';

const { projects, create, remove, clear } = useProjects()
const router = useRouter()

function toDetail(project: any) {
  console.log('to', project)
  router.push({ path: '/project-detail', query: { path: project.path } })
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
          <ElButton
            v-if="projects && projects.length"
            plain
            type="danger"
            @click="clear"
          >
            清空项目
          </ElButton>
        </template>
      </CrabFlex>
    </template>
    <template #main>
      <ElCard
        v-for="(project, i) in projects"
        :key="i"
        class="h-80 w-80 m-1"
        shadow="hover"
        @click="toDetail(project)"
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

</style>