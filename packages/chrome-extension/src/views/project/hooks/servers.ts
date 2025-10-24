import { useProjects } from "@/store/projects"
import { request } from "@/utils/request"
import { useIntervalFn } from "@vueuse/core"
import { SERVER_BASE_PATH, SERVER_BASE_PORT } from "@zdmin/ara-shared"
import { differenceWith, intersectionWith, uniq, uniqWith } from "es-toolkit"
import { useAsyncData } from "vue-asyncx"

const { projects, create } = useProjects()
const update = (project: any) => {
  if (!project || !projects.value.find(item => item.path === project.path)) return
  create(project)
}

const TIMEOUT = 1 * 1000

// map server <=> data
const data = new Map<string, { 
  promise: Promise<any>
  timestamp: number 
}>()

function single(server: string, { silent = true } = {}) {
  if (!data.has(server)) data.set(server, { timestamp: 0, promise: Promise.resolve() })
  const info = data.get(server)!
  if (Date.now() - info.timestamp < TIMEOUT) return info.promise
  info.timestamp = Date.now()
  info.promise = request({ 
    baseURL: `${server}${SERVER_BASE_PATH}`,
    url: `/project`, 
    method: 'get',
    ara: { silent }
  })
    .then((data: any) => {
      data = {
        ...data,
        server
      }
      update(data)
      return data
    })
    .catch(() => {})
  return info.promise
}

function multiple(servers: Iterable<string>, { 
  silent = true,
  parallel = false
} = {}) {
  if (parallel) return Promise.allSettled([...servers].map(server => single(server)))
    .then(servers => servers.filter(item => item.status === 'fulfilled').filter(item => !!item.value).map(item => item.value))
  return new Promise((resolve) => {
    let p = Promise.resolve()
    const results: any[] = []
    for (const server of servers) {
      const query = () => single(server, { silent })
      if (parallel) p = p.then(() => query().then(server => server && results.push(server)))
    }
    p.then(() => resolve(results))
  })
}

function query(range = [SERVER_BASE_PORT, SERVER_BASE_PORT + 99]): Promise<any[]> {
  const BATCH_COUNT = 5
  return new Promise((resolve) => {
    let current = range[0]
    let p: Promise<any> = Promise.resolve()
    const projects: any[] = []
    while (current <= range[1]) {
      const step = (range[1] + 1) - current < BATCH_COUNT 
        ? (range[1] + 1) - current
        : BATCH_COUNT
      p = multiple(Array.from({ 
        length: step
      }).fill(0).map((_, i) => `http://localhost:${current + i}`), { parallel: true })
        .then((items: any) => projects.push(...items))
      current += step
    }
    p.then(() => resolve(projects))
  })
}

export function useLocalServers() {
  // 两个操作：1. 发现新的服务 2. 更新已发现服务的状态

  const { projects } = useProjects()
  const {
    projects: _localServerProjects,
    queryProjects,
    queryProjectsLoading
  } = useAsyncData('projects', () => query(), { initialData: [], immediate: true })
  const localServerProjects = computed(() => uniqWith(_localServerProjects.value, (a, b) => a.path === b.path))
  const free = computed(() => differenceWith(localServerProjects.value, projects.value, (a, b) => a.path === b.path))
  const used = computed(() => intersectionWith(localServerProjects.value, projects.value, (a, b) => a.path === b.path))
  const { pause, resume, isActive } = useIntervalFn(queryProjects, 5 * 1000, { 
    immediate: false, 
    immediateCallback: true 
  })
  watch(localServerProjects, (projects) => {
    if (Array.isArray(projects) && projects.length) return isActive.value && pause()
    if (!isActive.value) resume()
  })

  return {
    // 游离项目
    free, 
    // 记录项目
    used,
    // 可用服务
    servers: computed(() => uniq(localServerProjects.value.map(item => item.server))),
    // 刷新列表
    refresh: queryProjects,
    refreshLoading: queryProjectsLoading
  }
}

export function useServerConnected(server: MaybeRefOrGetter<string | undefined>) {
  const { data, queryData } = useAsyncData(() => {
    const _server = toValue(server)
    if (!_server) return
    return single(_server)
  }, { immediate: true, watch: () => toValue(server) })
  useIntervalFn(queryData, 2 * 1000)
  return computed(() => data.value)
}