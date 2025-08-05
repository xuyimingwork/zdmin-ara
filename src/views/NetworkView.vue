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
</script>

<template>
  <div class="network-view">
    <div>
      <Icon icon="mdi:refresh" />
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