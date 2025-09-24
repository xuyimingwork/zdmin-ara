<script setup lang="ts">
  import { useServerConnected } from '@/views/project/hooks/servers';
  import { request } from '@/utils/request';
  import { Close, Delete } from '@element-plus/icons-vue';
  import { CrabFlex } from '@zdmin/crab';
  import { useAsync } from 'vue-asyncx';
  import { useProject } from '@/views/project/hooks/project';
  import ProjectListItem from '@/views/project/ProjectListItem.vue';
  import BaseItem from '@/views/project/components/BaseItem.vue';
  import { useNetwork } from '@/store/network';
  import { uniqWith } from 'es-toolkit';
  import { reverse } from 'es-toolkit/compat';

  const props = defineProps<{
    path: string
  }>()

  defineEmits<{
    close: []
    remove: []
  }>()

  const { project } = useProject(() => props.path)
  const connected = useServerConnected(() => project.value?.server)

  const { openapis: _openapis } = useNetwork()
  const openapis = computed(() => reverse(uniqWith(reverse(_openapis.value), (a, b) => a.request.request.url === b.request.request.url)))

  const { reload } = useAsync('reload', function reload(doc?: any) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true, currentWindow: true })
      .then(([tab]) => {
        const { url } = doc
        if ((tab?.url === url)) return chrome.tabs.reload().then(() => tab)
        return chrome.tabs.update(undefined, { url });
      })
  })

  function upload(content: any, name?: string) {
    if (!connected.value) return ElMessage.warning('服务未连接')
    return request({
      method: 'post',
      url: `${project.value?.server}/openapi-codegen/openapi`,
      data: {
        data: content,
        name: name || ''
      } 
    })
      .then((data: any) => {
        ElMessage.success(`上传成功：共 ${data.files?.length} 个文件、${data.statistic?.functions} 个 API`)
      })
  }

  function getDocOf(url?: string) {
    if (!url || !project.value) return
    const docs = project.value.docs
    if (!Array.isArray(docs) || !docs) return
    return docs.find(item => typeof item.url === 'string' && item.url.startsWith(url))
  }
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
    <BaseItem
      v-for="doc of project?.docs"
      :key="doc.name"
      :title="doc.name"
      :subtitle="doc.url"
      tip="点击访问"
      @click="reload(doc)"
    />
    <ElCollapse>
      <ElCollapseItem
        v-for="(record, i) in openapis"
        :key="i"
      >
        <template #title>
          <CrabFlex :main="{ class: 'text-nowrap truncate' }">
            <template #start>
              <ElButton
                circle
                @click.stop="upload(record.content, getDocOf(record.url)?.name)"
              >
                <template #icon>
                  <Icon icon="mdi:upload" />
                </template>
              </ElButton>
              <ElTag
                v-if="getDocOf(record.url)"
                type="success"
                class="mx-2"
              >
                {{ getDocOf(record.url)?.name }}
              </ElTag>
            </template>
            {{ record.url }}
          </CrabFlex>
        </template>
        <div>{{ record.request.request.url }}</div>
        {{ record.content }}
      </ElCollapseItem>
    </ElCollapse>
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