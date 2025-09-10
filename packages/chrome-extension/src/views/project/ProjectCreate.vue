<script setup lang="ts">
  import { request } from '@/utils/request';
  import { MagicStick } from '@element-plus/icons-vue';
  import { useAsyncData } from 'vue-asyncx';

  defineEmits<{
    create: [v: any]
  }>()

  const {
    servers
  } = useAsyncData('servers', () => query([9125, 9155]), { initialData: [], immediate: true })

  // 自动发现
  function query(range = [1, 65535]): Promise<any[]> {
    return new Promise((resolve) => {
      const query = (port: number) => {
        const server = `http://localhost:${port}`
        return request({ 
          url: `${server}/openapi-codegen/project`, 
          method: 'get',
          ara: { silent: true }
        })
          .then(data => ({
            ...data,
            server
          }))
          .catch(() => {})
      }
      let port = range[0]
      let p: Promise<any> = Promise.resolve()
      const servers: any[] = []
      const record = (server: any) => server ? servers.push(server) : undefined
      while (port <= range[1]) {
        const current = port
        p = p.then((data) => {
          record(data)
          return query(current)
        })
        port++
      }
      p.then(record).then(() => resolve(servers))
    })
  }

  const server = ref()
  const { project, queryProjectLoading } = useAsyncData('project', () => {
    if (!server.value) return
    const _server = server.value
    return request({ 
      url: `${_server}/openapi-codegen/project`, 
      method: 'get',
      ara: { silent: true }
    })
      .then(data => ({
        ...data,
        server: _server
      }) as any)
      .catch(() => {})
  }, { immediate: true, watch: () => server.value })

  
</script>

<template>
  <ElForm label-width="100px">
    <ElFormItem label="服务器">
      <ElInput v-model="server">
        <template
          v-if="servers && servers.length"
          #prefix
        >
          <ElDropdown>
            <ElIcon class="cursor-pointer">
              <MagicStick />
            </ElIcon>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  v-for="(item, i) in servers"
                  :key="i"
                  @click="server = item.server"
                >
                  <div>
                    <div class="text-base">
                      {{ item.server }}
                    </div>
                    <div
                      class="text-sm text-(--el-text-color-secondary)"
                    >
                      {{ item.path }}
                    </div>
                  </div>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </template>
      </ElInput>
    </ElFormItem>
    <ElFormItem
      v-loading="queryProjectLoading"
      label="路径"
    >
      {{ project?.path }}
    </ElFormItem>
    <ElFormItem>
      <ElButton
        type="primary"
        :disabled="!project"
        @click="project && $emit('create', project)"
      >
        保存
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>