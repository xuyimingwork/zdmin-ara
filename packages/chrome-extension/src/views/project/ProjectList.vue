<script setup lang="ts">
import { useProjects } from '@/store/projects';
import { useLocalServers } from '@/views/project/hooks/servers';
import ProjectCreate from '@/views/project/ProjectCreate.vue';
import ProjectListPure from '@/views/project/ProjectListPure.vue';
import { Delete, InfoFilled, Operation, Plus, Refresh } from '@element-plus/icons-vue';
import { CrabFlex } from '@zdmin/crab';
import pkg from '~/package.json'

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
      <BaseBar divider="bottom">
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
          <ElDropdown
            placement="bottom-end"
            :popper-options="{
              modifiers: [{
                name: 'offset',
                options: {
                  offset: [0, 4] // [horizontal, vertical] offset in px
                }
              }]
            }"
          >
            <ElButton
              :icon="Operation"
              circle
              size="large"
              text
            />
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  v-if="projects && projects.length"
                  :icon="Delete"
                  data-ara-type="danger"
                  @click="() => clear()"
                >
                  删除全部项目
                </ElDropdownItem>
                <ElDropdownItem
                  :icon="InfoFilled"
                >
                  {{ pkg.version }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </template>
      </BaseBar>
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