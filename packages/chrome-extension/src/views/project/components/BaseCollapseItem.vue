<script setup lang="ts">

</script>

<template>
  <ElCollapseItem class="base-collapse-item">
    <template
      v-for="name of Object.keys($slots)"
      #[name]="scope"
    >
      <slot
        :name="name"
        v-bind="scope"
      />
    </template>
  </ElCollapseItem>
</template>

<style lang="scss" scoped>
  .base-collapse-item {
    --el-collapse-header-height: 22px;

    > :deep(.el-collapse-item__header) {
      font-weight: normal;

      > .el-collapse-item__title {
        line-height: 1.15;
        display: flex;
        align-items: center;        
      }
    }
  }
</style>