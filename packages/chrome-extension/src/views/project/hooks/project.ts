import { useProjects } from "@/store/projects"
import { useLocalServers } from "@/views/project/hooks/servers"

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