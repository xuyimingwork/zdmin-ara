<script setup lang="ts">
  import { Close, Delete, HomeFilled, Operation } from '@element-plus/icons-vue';
  import { CrabFlex } from '@zdmin/crab';
  import { useProject } from '@/views/project/hooks/project';
  import ProjectListItem from '@/views/project/ProjectListItem.vue';
  import BaseItem from '@/views/project/components/BaseItem.vue';
  import ProjectDocDetail from '@/views/project/ProjectDocDetail.vue';
  import { useProjects } from '@/store/projects';
  import { useLocalServers } from '@/views/project/hooks/servers';
  import ProjectListPure from '@/views/project/ProjectListPure.vue';

  const props = defineProps<{
    path: string
  }>()

  defineEmits<{
    close: []
    remove: []
  }>()

  const { project } = useProject(() => props.path)
  const { remove: _remove } = useProjects()
  const remove = () => _remove(project.value)
  const route = useRoute()
  const activeDoc = ref()
  watch(() => props.path, () => activeDoc.value = undefined, { immediate: true })

  const { projects: usedProjects } = useProjects()
  const { free: freeProjects } = useLocalServers()
  const projects = computed(() => [...usedProjects.value, ...freeProjects.value].filter(project => project.path !== props.path))
</script>

<template>
  <CrabFlex
    class="project-detail"
    direction="column"
  >
    <template #start>
      <BaseBar
        divider="bottom"
        :start="{ class: 'flex items-center' }"
      >
        <template #start>
          <ElDropdown v-if="route.name === 'project-detail'">
            <ElButton
              :icon="HomeFilled"
              circle
              title="项目页"
              size="large"
              text
              @click="$router.push('/project')"
            />
            <template #dropdown>
              <ProjectListPure
                :projects="projects"
                @click-item="project => {
                  $router.push({ 
                    name: 'project-detail', 
                    query: { path: project.path }
                  })
                }"
              />
            </template>
          </ElDropdown>
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
          <ElDropdown>
            <ElButton
              :icon="Operation"
              circle
              size="large"
              text
            />
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  :icon="Delete"
                  @click="() => {
                    remove()
                    if (route.name !== 'project-detail') $emit('remove')
                    else $router.push('/project')
                  }"
                >
                  删除项目
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </template>
      </BaseBar>
    </template>
    <CrabFlex 
      style="height: 100%;"
      :start="{ style: `width: ${activeDoc ? '200px' : '100%'}` }"
      :main="{ style: 'border-left: 1px solid var(--color-divider); height: 100%; overflow-y: auto;' }"
    >
      <template #start>
        <CrabFlex direction="column">
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
          <template
            v-if="project?.docs"
            #end
          >
            <BaseBar divider="top">
              <span v-if="project?.docs?.length">{{ project?.docs?.length }}份文档</span>
            </BaseBar>
          </template>
        </CrabFlex>
      </template>
      <template
        v-if="activeDoc"
        #default
      >
        <ProjectDocDetail
          :path="path"
          :doc="activeDoc"
          @close="activeDoc = undefined"
        />
      </template>
    </CrabFlex>
  </CrabFlex>
</template>

<style lang="scss" scoped>
  .el-collapse-item {
    :deep(.el-collapse-item__title) {
      overflow: hidden;
    }
  }
</style>