<script setup lang="ts">
  import { ref, onBeforeUnmount } from 'vue';

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
  Network View
  <ul>
    <li v-for="(request, index) in requests" :key="index">
      {{ request }}
    </li>
  </ul>
</template>