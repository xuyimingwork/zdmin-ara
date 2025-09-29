<script setup lang="ts">
import { CrabFlex } from '@zdmin/crab';

  defineProps<{
    divider?: 'top' | 'bottom'
  }>()
</script>

<template>
  <CrabFlex
    class="base-bar items-center px-1" 
    :class="{
      'base-bar--divider-top': divider === 'top',
      'base-bar--divider-bottom': divider === 'bottom',
    }"
  >
    <template
      v-for="name of Object.keys($slots)"
      #[name]="scope"
    >
      <slot
        :name="name"
        v-bind="scope"
      />
    </template>
  </CrabFlex>
</template>

<style lang="scss" scoped>
  .base-bar {
    min-height: 26px;
    &--divider-top {
      border-top: 1px solid var(--color-divider);
    }
    &--divider-bottom {
      border-bottom: 1px solid var(--color-divider);
    }
  }
</style>