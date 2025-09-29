<script setup lang="ts">
import { useNetwork } from '@/store/network';
import { reload } from '@/utils/chrome';
import BaseCollapseItem from '@/views/project/components/BaseCollapseItem.vue';
import BaseItem from '@/views/project/components/BaseItem.vue';
import { useProjectCodeGen } from '@/views/project/hooks/project';
import { CaretRight, Close, Refresh, Upload } from '@element-plus/icons-vue';
import { CrabFlex } from '@zdmin/crab';
import { find, reverse } from 'es-toolkit/compat';
import { useAsyncData } from 'vue-asyncx';

const props = defineProps<{
  path: string,
  doc: {
    url: string,
    outDir: string,
    name?: string
  }
}>()

defineEmits<{
  close: []
}>()

const { openapis, records } = useNetwork()
// 最新的在第一个
const requests = computed(() => reverse(openapis.value.filter(item => props.doc.url?.startsWith(item.url))))


function getDefaultActive() {
  if (!Array.isArray(requests.value) || !requests.value.length) return
  return requests.value[0]
}
const active = ref()
watch(requests, () => {
  if (active.value && requests.value.includes(active.value)) return
  active.value = getDefaultActive()
}, { immediate: true })

const { preview: _preview, upload, uploadLoading } = useProjectCodeGen(() => props.path)

const {
  queryPreviewResult: preview,
  previewResult,
  queryPreviewResultLoading: previewLoading,
  queryPreviewResultError
} = useAsyncData('previewResult', () => {
  if (!active.value || !active.value.content) return
  return _preview(active.value.content, props.doc.name) as unknown as any
}, { watch: active, immediate: true })

const TABS = [
  { value: 'preview', label: '预览' },
  { value: 'raw', label: '原始数据' }
] as const
const tab = ref<'raw' | 'preview'>('preview')

function basename(output: string) {
  if (typeof output !== 'string') return output
  if (output.startsWith(props.doc.outDir)) return output.substring(props.doc.outDir.length)
  return output
}

const DiffList = [
  {
    type: 'new',
    value: 'success',
    label: '新增'
  }, {
    type: 'update',
    value: 'warning',
    label: '修改'
  }, {
    type: 'same',
    label: '无更改'
  }, {
    type: 'unknown',
    value: 'info',
    label: '未知'
  }
]

watch(() => props.doc.url, () => {
  if (!props.doc.url) return
  if (requests.value.length) return
  reload(props.doc.url)
}, { immediate: true })

</script>

<template>
  <CrabFlex
    direction="column"
    class="project-doc-detail"
  >
    <template #start>
      <BaseBar
        divider="bottom"
        :start="{ class: 'flex items-center' }"
      >
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
        <div
          v-if="active"
          class="break-all line-clamp-1"
          :title="active.request.request.url"
        >
          {{ active.request.request.url }}
        </div>
        <div
          v-else-if="records.length"
          class="break-all line-clamp-1"
        >
          加载中：{{ records[records.length - 1].request.request.url }}
        </div>
      </BaseBar>
      <BaseBar
        v-if="active"
        divider="bottom"
      >
        <template #default>
          <ElDropdown
            placement="bottom-start"
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
              :icon="CaretRight"
              text
            >
              {{ TABS.find(item => item.value === tab)?.label }}
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  v-for="item in TABS"
                  :key="item.value"
                  @click="tab = item.value"
                >
                  {{ item.label }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </template>
        <template
          v-if="tab === 'preview'"
          #end
        >
          <ElButton
            :icon="Upload"
            text
            :loading="uploadLoading"
            type="primary"
            @click="upload(active.content, doc.name).then(() => preview())"
          >
            生成
          </ElButton>
        </template>
      </BaseBar>
    </template>
    <template
      v-if="active"
      #default
    >
      <pre v-if="tab === 'raw'">{{ JSON.stringify(active?.content, undefined, 2) }}</pre>
      <div
        v-else-if="tab === 'preview'"
        v-loading="previewLoading"
        style="height: 100%; overflow-y: auto;"
      > 
        <div
          v-if="queryPreviewResultError"
          class="p-3"
        >
          <ElAlert
            v-loading="previewLoading"
            :title="`预览失败：${queryPreviewResultError?.message || queryPreviewResultError || '未知错误'}`"
            center
            type="error"
            :closable="false"
            show-icon
            @click="preview()"
          />
        </div>
        <ElCollapse v-else>
          <BaseCollapseItem
            v-for="file of previewResult?.files"
            :key="file.output"
          >
            <template #title>
              <BaseItem
                :title="basename(file.output)"
                :status="(find(DiffList, item => item.type === file.diff)?.value as any)"
                :status-title="(find(DiffList, item => item.type === file.diff)?.label as any)"
                no-hover
              />
            </template>
            <pre>{{ file.content }}</pre>
          </BaseCollapseItem>
        </ElCollapse>
      </div>
    </template>
    <template
      v-else
      #default
    >
      <ElEmpty
    
        description="未发现文档请求，您可以"
      >
        <ElButton
          :icon="Refresh"
          @click="reload(props.doc.url)"
        >
          刷新页面
        </ElButton>
      </ElEmpty>
    </template>
    <template
      v-if="tab === 'preview' && previewResult"
      #end
    >
      <BaseBar divider="top">
        <span>{{ previewResult?.files?.length || 0 }}份文件</span>
        <ElDivider direction="vertical" />
        <span>{{ previewResult?.statistic?.functions || 0 }}个函数</span>
      </BaseBar>
    </template>
  </CrabFlex>
</template>

<style lang="scss" scoped>
  .project-doc-detail {

  }

</style>