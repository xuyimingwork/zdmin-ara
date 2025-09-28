<script setup lang="ts">
  defineProps<{
    title?: string
    subtitle?: string
    status?: 'primary' | 'success' | 'info' | 'warning'
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
    <slot name="start" />
    <span
      v-if="status"
      class="size-[9px] rounded-full inline-block mr-1"
      :class="{
        'animate-pulse': statusPulse,
        'bg-(--el-color-primary)': status === 'primary',
        'bg-(--el-color-success)': status === 'success',
        'bg-(--el-color-warning)': status === 'warning',
        'bg-(--el-color-info)': status === 'info',
      }"
      :title="statusTitle"
    />
    <span
      class="text-(--el-text-color-primary) font-medium"
      :title="title"
    >{{ title }}</span>
    <span
      class="base-item__subtitle ml-1 text-(--el-text-color-regular) break-all line-clamp-1"
      :title="subtitle"
    >{{ subtitle }}</span>
    <slot name="end" />
  </div>
</template>

<style lang="scss" scoped>
  .base-item {
    display: flex;
    align-items: center;

    > * {
      flex: 0 0 auto;
    }

    &__subtitle {
      flex: auto;
    }

    &--hover:hover {
      background-color: color-mix(in srgb, #1f1f1fff 6%, transparent);
    }
  }
</style>