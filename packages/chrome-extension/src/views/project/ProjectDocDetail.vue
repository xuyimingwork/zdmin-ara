<script setup lang="ts">
import { useNetwork } from '@/store/network';
import { reload } from '@/utils/chrome';
import BaseCollapseItem from '@/views/project/components/BaseCollapseItem.vue';
import BaseItem from '@/views/project/components/BaseItem.vue';
import { useProjectCodeGen } from '@/views/project/hooks/project';
import { Refresh } from '@element-plus/icons-vue';
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

const { openapis } = useNetwork()
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
    value: 'info',
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
    v-if="active"
    direction="column"
    class="project-doc-detail"
    :start="{ class: 'project-doc-detail__toolbar' }"
  >
    <template #start>
      <CrabFlex class="project-doc-detail__toolbar items-center">
        <div
          class="break-all line-clamp-1"
          :title="active.request.request.url"
        >
          {{ active.request.request.url }}
        </div>
        <CrabFlex>
          <template #default>
            <ElSelect
              v-model="tab"
              style="width: 90px;"
            >
              <ElOption
                v-for="item in [
                  { value: 'preview', label: '生成预览' },
                  { value: 'raw', label: '请求数据' }
                ]"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </template>
          <template
            v-if="tab === 'preview'"
            #end
          >
            <ElButton
              :loading="uploadLoading"
              type="primary"
              @click="upload(active.content, doc.name).then(() => preview())"
            >
              生成
            </ElButton>
          </template>
        </CrabFlex>
      </CrabFlex>
    </template>
    <template #default>
      <pre v-if="tab === 'raw'">{{ JSON.stringify(active?.content, undefined, 2) }}</pre>
      <div
        v-else-if="tab === 'preview'"
        v-loading="previewLoading"
        style="height: 100%; overflow-y: auto;"
      >
        <div v-if="queryPreviewResultError">
          {{ queryPreviewResultError }}
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
      v-if="tab === 'preview' && previewResult"
      #end
    >
      <CrabFlex class="project-doc-detail__statusbar items-center">
        <span>{{ previewResult?.files?.length || 0 }}份文件</span>
        <ElDivider direction="vertical" />
        <span>{{ previewResult?.statistic?.functions || 0 }}个函数</span>
      </CrabFlex>
    </template>
  </CrabFlex>
  <ElEmpty
    v-else
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

<style lang="scss" scoped>
  .project-doc-detail {
    &__toolbar {
      border-bottom: 1px solid var(--color-divider);
      min-height: 26px;
      line-height: 26px;
    }
    &__statusbar {
      border-top: 1px solid var(--color-divider);
      min-height: 26px;
    }
  }

</style>