import { useProjects } from "@/store/projects"
import { request } from "@/utils/request"
import { useLocalServers, useServerConnected } from "@/views/project/hooks/servers"
import { useAsync, useAsyncData } from "vue-asyncx"

export function useProject(path: MaybeRefOrGetter<string | undefined>) {
  const { projects } = useProjects()
  const usedProject = computed(() => projects.value.find(item => item.path === toValue(path)))

  const { free: freeProjects } = useLocalServers()
  const freeProject = computed(() => freeProjects.value.find(item => item.path === toValue(path)))

  const project = computed(() => {
    return usedProject.value || freeProject.value
  })

  return { 
    project, 
    used: computed(() => !!usedProject.value) 
  }
}

export function useProjectConnected(path: MaybeRefOrGetter<string | undefined>) {
  const { project } = useProject(path)
  const serverConnected = useServerConnected(() => project.value?.server)
  return computed(() => !!serverConnected.value && serverConnected.value.path === project.value?.path)
}

export function useProjectCodeGen(path: MaybeRefOrGetter<string | undefined>) {
  const { project } = useProject(path)
  const connected = useProjectConnected(path)

  function openapi(content: any, name?: string, preview?: boolean) {
    if (!connected.value) throw Error('服务未连接')
    return request({
      method: 'post',
      url: `${project.value?.server}/openapi-codegen/openapi`,
      data: {
        preview,
        data: content,
        name: name || ''
      },
      ara: {
        silent: true
      }
    })
  }

  const { upload, uploadLoading } = useAsync('upload', (content: any, name?: string) => {
    return openapi(content, name, false)
      .then((data: any) => {
        ElMessage.success(`上传成功：共 ${data.files?.length} 个文件、${data.statistic?.functions} 个 API`)
      })
  })

  const { 
    previewResult,
    queryPreviewResultLoading: previewLoading,
    queryPreviewResult: preview,
  } = useAsyncData('previewResult', (content: any, name?: string) => {
    return openapi(content, name, true)
  })

  return {
    preview, 
    previewLoading,
    previewResult,
    upload, 
    uploadLoading
  }
}