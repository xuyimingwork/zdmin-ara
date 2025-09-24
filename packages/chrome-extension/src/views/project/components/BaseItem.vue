<script setup lang="ts">
  defineProps<{
    title?: string
    subtitle?: string
    status?: 'success' | 'info'
    statusTitle?: string
    statusPulse?: boolean
    noHover?: boolean
    tip?: string
  }>()
</script>

<template>
  <div
    class="base-item p-1"
    :class="{ 
      'cursor-pointer': !!$attrs.onClick,
      'base-item--hover': !noHover
    }"
    :title="tip"
  >
    <span
      v-if="status"
      class="size-[9px] rounded-full inline-block mr-1"
      :class="{
        'animate-pulse': statusPulse,
        'bg-(--el-color-success)': status === 'success',
        'bg-(--el-color-info)': status === 'info'
      }"
      :title="statusTitle"
    />
    <span
      class="text-(--el-text-color-primary) font-medium"
      :title="title"
    >{{ title }}</span>
    <span
      class="ml-1 text-(--el-text-color-regular)"
      :title="subtitle"
    >{{ subtitle }}</span>
  </div>
</template>

<style lang="scss" scoped>
  .base-item {
    &--hover:hover {
      background-color: color-mix(in srgb, #1f1f1fff 6%, transparent);
    }
  }
</style>