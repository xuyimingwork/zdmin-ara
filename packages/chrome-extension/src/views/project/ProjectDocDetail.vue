<script setup lang="ts">
  import { useNetwork } from '@/store/network';
  import { reload } from '@/utils/chrome';
  import BaseCollapseItem from '@/views/project/components/BaseCollapseItem.vue';
  import BaseItem from '@/views/project/components/BaseItem.vue';
  import { useProjectCodeGen } from '@/views/project/hooks/project';
  import { Refresh } from '@element-plus/icons-vue';
  import { CrabFlex } from '@zdmin/crab';
  import { reverse } from 'es-toolkit/compat';
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

  const { preview: _preview } = useProjectCodeGen(() => props.path)

  const { 
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
</script>

<template>
  <CrabFlex
    v-if="active"
    direction="column"
  >
    <template #start>
      <div>{{ active.request.request.url }}</div>  
      <ElButton
        :type="tab === 'preview' ? 'primary' : undefined"
        @click="tab = 'preview'"
      >
        生成预览
      </ElButton>
      <ElButton
        :type="tab === 'raw' ? 'primary' : undefined"
        @click="tab = 'raw'"
      >
        原始数据
      </ElButton>
    </template>
    <template #default>
      <pre v-if="tab === 'raw'">{{ JSON.stringify(active?.content, undefined, 2) }}</pre>
      <div
        v-else-if="tab === 'preview'"
        v-loading="previewLoading"
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
                :subtitle="file.output.replace(basename(file.output), '')"
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
      <span>{{ previewResult?.files?.length || 0 }}份文件</span>
      <ElDivider direction="vertical" />
      <span>{{ previewResult?.statistic?.functions || 0 }}个函数</span>
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