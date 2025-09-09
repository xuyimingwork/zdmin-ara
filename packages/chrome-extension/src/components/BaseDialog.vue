<script setup lang="ts">
  defineOptions({ inheritAttrs: false }) 
  
  const inited = ref(false)
  const visible = ref(false)
  function open() {
    if (!inited.value) inited.value = true
    visible.value = true
  }
  function close() {
    visible.value = false
  }

  defineExpose({ open, close })
</script>

<template>
  <slot
    name="trigger"
    :open="open" />
  <ElDialog
    v-if="inited"
    v-model="visible"
    align-center
    append-to-body
    destroy-on-close
    draggable
    v-bind="$attrs"
  >
    <slot :close="close" />
    <slot
      :close="close"
      name="footer" />
  </ElDialog>
</template>