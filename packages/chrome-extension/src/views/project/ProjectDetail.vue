<script setup lang="ts">
  import { useServerConnected } from '@/views/project/hooks/servers';
  import { request } from '@/utils/request';
  import { Close, Delete } from '@element-plus/icons-vue';
  import { CrabFlex } from '@zdmin/crab';
  import { useAsync } from 'vue-asyncx';
  import { useProject } from '@/views/project/hooks/project';

  const props = defineProps<{
    path: string
  }>()

  defineEmits<{
    close: []
    remove: []
  }>()

  const { project } = useProject(() => props.path)

  const connected = useServerConnected(() => project.value?.server)

  const active = ref()
  const requests = ref<chrome.devtools.network.Request[]>([]);

  function add(request: chrome.devtools.network.Request) {
    requests.value.push(request);
  }

  chrome.devtools.network.onRequestFinished.addListener(add);
  onBeforeUnmount(() => chrome.devtools.network.onRequestFinished.removeListener(add))

  const content = ref(new WeakMap<chrome.devtools.network.Request, { content: any, encoding: string } | undefined>())
  watch(() => requests.value.length, () => {
    requests.value.forEach(request => {
      if (request.response.content.mimeType !== 'application/json') return
      if (content.value.has(request)) return
      content.value.set(request, undefined);
      request.getContent((body, encoding) => {
        content.value.set(request, { 
          content: body ? JSON.parse(body) : undefined, 
          encoding: encoding,
        });  
      })
    })
  })

  const { reload, reloadArgumentFirst, reloadLoading } = useAsync('reload', function reload(doc?: any) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true, currentWindow: true })
      .then(([tab]) => {
        console.log('tabs query', tab)
        active.value = doc
        requests.value = [];
        const { path: url } = doc
        if ((tab?.url === url)) return chrome.tabs.reload().then(() => tab)
        return chrome.tabs.update(undefined, { url });
      })
  })

  const isOpenAPIDoc = (data: any) => data && (data.openapi || data.swagger)

  const openApiDocs = computed(() => {
    return requests.value.filter(request => {
      const data = content.value.get(request)
      return data && isOpenAPIDoc(data.content)
    }).map(request => ({ 
      ...request, 
      content: content.value.get(request)?.content 
    }))
  })

  function upload(content: any) {
    if (!connected.value) return ElMessage.warning('服务未连接')
    if (!isOpenAPIDoc(content)) return ElMessage.warning('非 OpenAPI 文档')
    return request({
      method: 'post',
      url: `${project.value?.server}/openapi-codegen/openapi`,
      data: {
        data: content,
        name: active.value.name
      } 
    })
      .then((data: any) => {
        ElMessage.success(`上传成功：共 ${data.files?.length} 个文件、${data.count} 个 API`)
      })
  }
</script>

<template>
  <CrabFlex
    class="project-detail"
    direction="column"
  >
    <template #start>
      <div class="project-detail__toolbar">
        <CrabFlex>
          <template #start>
            <ElButton
              :icon="Close"
              circle
              title="关闭"
              size="large"
              text
              @click="$emit('close')"
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
      </div>
    </template>
    <div>项目：{{ project?.path }}</div>
    <div>
      服务：{{ project?.server }}<ElTag
        :type="connected ? 'success' : 'info'"
      >
        {{ connected ? '已连接' : '未连接' }} 
      </ElTag>
    </div>
    <div>输出：{{ project?.output }}</div>
    <div>文档</div>
    <ul class="w-full">
      <li
        v-for="doc of project?.docs"
        :key="doc.path"
        class="text-nowrap truncate"
        :title="doc.path"
      >
        <ElButton
          circle
          :loading="reloadLoading && reloadArgumentFirst === doc.path"
          @click="reload(doc)"
        >
          <template #icon>
            <Icon icon="mdi:refresh" />
          </template>
        </ElButton>
        <span v-if="doc.name">{{ doc.name }}：</span>{{ doc.path }}
      </li>
    </ul>
    <ElCollapse>
      <ElCollapseItem
        v-for="(docs, i) in openApiDocs"
        :key="i"
      >
        <template #title>
          <CrabFlex :main="{ class: 'text-nowrap truncate' }">
            <template #start>
              <ElButton
                circle
                @click.stop="upload(docs.content)"
              >
                <template #icon>
                  <Icon icon="mdi:upload" />
                </template>
              </ElButton>
            </template>
            {{ docs.request.url }}
          </CrabFlex>
        </template>
        {{ docs.content }}
      </ElCollapseItem>
    </ElCollapse>
    <template #end>
      <CrabFlex class="&__statusbar">
        <span v-if="project?.docs?.length">{{ project?.docs?.length }}份文档</span>
      </CrabFlex>
    </template>
  </CrabFlex>
</template>

<style lang="scss" scoped>
  .project-detail {
    &__toolbar {
      border-bottom: 1px solid var(--color-divider);
    }
    &__statusbar {
      border-top: 1px solid var(--color-divider);
    }
  }
    
  .el-collapse-item {
    :deep(.el-collapse-item__title) {
      overflow: hidden;
    }
  }
</style>