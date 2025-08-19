<script setup lang="ts">
  const requests = ref<chrome.devtools.network.Request[]>([]);

  function add(request: chrome.devtools.network.Request) {
    requests.value.push(request);
  }

  chrome.devtools.network.onRequestFinished.removeListener(add)
  chrome.devtools.network.onRequestFinished.addListener(add);
  onBeforeUnmount(() => {
    chrome.devtools.network.onRequestFinished.removeListener(add)
  })

  function reload() {
    requests.value = [];
    chrome.tabs.reload();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isOpenAPI = (data: any) => data && (data.openapi || data.swagger)

  const active = ref<chrome.devtools.network.Request>()
  function upload() {
    if (!active.value || !isOpenAPI(content.value.get(active.value)?.content)) return ElMessage.warning('请选择合适的请求')
    fetch('http://localhost:9125/openapi-codegen/openapi', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: content.value.get(active.value)?.content
      })
    })
      .then((res) => res.json())
      .then(data => {
        if (!data.ok) return ElMessage.error(data.message || '上传失败')
        ElMessage.success('上传成功')
      })
  }
</script>

<template>
  <div class="network-view">
    <div class="network-view-toolbar">
      <ElButton circle @click="reload()">
        <template #icon><Icon icon="mdi:refresh" /></template>
      </ElButton>
      <ElButton circle @click="upload">
        <template #icon><Icon icon="mdi:upload" /></template>
      </ElButton>
    </div>
    <div class="network-view-body">
      <ul>
        <li v-for="(request, index) in requests" :key="index" @click="active = request"
          :class="{ active: active === request }">
          {{ request.request.url }}
          <div v-if="content.has(request) && isOpenAPI(content.get(request)?.content)">{{ content.get(request)?.content }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .network-view {
    display: flex;
    flex-direction: column;
    height: 100%;

    &-body {
      flex: auto;
      overflow-y: auto;
    }

    .active {
      outline: 1px solid lightblue;
    }
  }
</style>