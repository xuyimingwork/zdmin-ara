import { useProjects } from "@/store/projects"
import { request } from "@/utils/request"
import { useIntervalFn } from "@vueuse/core"
import { differenceWith, intersectionWith, uniq } from "es-toolkit"
import { useAsyncData } from "vue-asyncx"

const { projects, create } = useProjects()
const update = (project: any) => {
  if (!project || !projects.value.find(item => item.path === project.path)) return
  create(project)
}

const PORT = 9125
const TIMEOUT = 1 * 1000

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
    url: `${server}/openapi-codegen/project`, 
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

function query(range = [PORT, PORT + 99]): Promise<any[]> {
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
  const { projects } = useProjects()
  const {
    projects: localServerProjects
  } = useAsyncData('projects', () => query(), { initialData: [], immediate: true })
  const free = computed(() => differenceWith(localServerProjects.value, projects.value, (a, b) => a.path === b.path))
  const used = computed(() => intersectionWith(localServerProjects.value, projects.value, (a, b) => a.path === b.path))
  return {
    // 游离项目
    free, 
    // 记录项目
    used,
    // 
    servers: computed(() => uniq(localServerProjects.value.map(item => item.server)))
  }
}

export function useServerConnected(server: MaybeRefOrGetter<string | undefined>) {
  const { data, queryData } = useAsyncData(() => {
    const _server = toValue(server)
    if (!_server) return
    return single(_server)
  }, { immediate: true, watch: () => toValue(server) })
  useIntervalFn(queryData, 2 * 1000)
  return computed(() => !!data.value)
}