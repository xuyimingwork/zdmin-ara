<script setup lang="ts">
  import { useNetwork } from '@/store/network';
  import { reload } from '@/utils/chrome';
  import { i18n } from '@/utils/i18n';
  import BaseItem from '@/views/project/components/BaseItem.vue';
  import { HomeFilled, Refresh } from '@element-plus/icons-vue';
  import { CrabFlex } from '@zdmin/crab';

  const { openapis } = useNetwork()
</script>

<template>
  <CrabFlex direction="column">
    <template #start>
      <BaseBar divider="bottom">
        <ElButton
          :icon="HomeFilled"
          circle
          :title="i18n('projectListPage')"
          size="large"
          text
          @click="$router.push('/project')"
        />
        <ElDivider
          direction="vertical"
          class="ml-0!"
        />
        <ElButton
          :icon="Refresh"
          circle
          :title="i18n('browserTabRefresh')"
          size="large"
          text
          @click="() => reload()"
        />
      </BaseBar>
    </template>
    <BaseItem
      v-for="(request, i) in openapis"
      :key="i"
      :title="request.url"
      :subtitle="request.request.request.url"
    />
  </CrabFlex>
</template>