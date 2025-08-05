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

  const query = () => {
    fetch('http://localhost:9125/openapi-codegen/files', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        requests.value
          .filter(req => content.value.get(req)?.content?.openapi)
          .map(req => ({
            content: JSON.stringify(content.value.get(req)?.content)
          }))
      )
    }).then(res => {
      console.log('OpenAPI Codegen Response:', res);
    })
  }
</script>

<template>
  <div class="network-view">
    <div class="network-view-toolbar">
      <ElButton circle @click="reload()">
        <template #icon><Icon icon="mdi:refresh" /></template>
      </ElButton>
      <ElButton circle @click="console.log(requests)">
        <template #icon><Icon icon="mdi:printer" /></template>
      </ElButton>
      <ElButton circle @click="query">
        <template #icon><Icon icon="mdi:connection" /></template>
      </ElButton>
    </div>
    <div class="network-view-body">
      <ul>
        <li v-for="(request, index) in requests" :key="index">
          {{ request.request.url }}
          <div v-if="content.has(request) && content.get(request)?.content?.openapi">{{ content.get(request)?.content }}</div>
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
  }
</style>