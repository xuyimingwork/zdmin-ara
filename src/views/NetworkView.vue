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
    chrome.tabs.reload();
  }
</script>

<template>
  <div class="network-view">
    <div class="network-view-toolbar">
      <ElButton circle @click="reload()">
        <template #icon><Icon icon="mdi:refresh" /></template>
      </ElButton>
    </div>
    <div>
      <ul>
        <li v-for="(request, index) in requests" :key="index">
          {{ request }}
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
  }
</style>