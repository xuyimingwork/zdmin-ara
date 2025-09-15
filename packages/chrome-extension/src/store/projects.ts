import { useStorage } from "@/hooks/storage";
import { isObjectLike } from "es-toolkit/compat";

/**
 * 浏览器插件本地缓存的项目信息
 */
export function useProjects() {
  const {
    projects: _projects,
    updateProjects,
    removeProjects,
  } = useStorage('projects', [] as {
    path: string
    server: string
    output: string
    docs: { 
      name?: string; 
      path: string 
    }[]
  }[])
  const projects = computed(() => Array.isArray(_projects.value) ? _projects.value : [])

  function update(projects: any[]) {
    return updateProjects(Array.isArray(projects) ? projects.filter(item => isObjectLike(item)) : [])
  }

  function create(v: any) {
    if (projects.value.find(item => item.path === v.path)) return update(projects.value.map(item => {
      if (item.path === v.path) return { ...item, ...v, updateTime: (new Date()).toISOString() }
      return item
    }))
    return update([{
      ...v,
      createTime: (new Date()).toISOString(),
      updateTime: (new Date()).toISOString(),
    }, ...projects.value])
  }

  function query(path: string) {
    return projects.value.find(item => item.path === path)
  }

  function remove(v: any) {
    if (!v || !query(v.path)) return
    return update(projects.value.filter(item => item.path !== v.path))
  }

  return {
    create, 
    remove,
    clear: removeProjects,
    query,
    projects
  }
}