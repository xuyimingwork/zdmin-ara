import { isJSON } from "es-toolkit";
import { isObjectLike } from "es-toolkit/compat";

// 每次导航发起后对应的请求
const navigations = ref<Array<{ 
  url: string 
  timestamp: number
  requests: chrome.devtools.network.Request[]
}>>([])
// 请求内容对应响应详情
const contents = ref<WeakMap<chrome.devtools.network.Request, { content: any, encoding: string } | undefined>>(new WeakMap())
// 请求列表
const requests = computed(() => navigations.value.map(({ requests }) => requests).flat())
// 请求+URL+内容列表
const records = computed(() => {
  return navigations.value.map(({ url, requests }) => requests.map(request => ({
    request, 
    url, 
    content: contents.value.get(request)?.content
  }))).flat()
});

function navigate(url?: string) {
  navigations.value.push({
    url: url || 'unknown', 
    timestamp: Date.now(),
    requests: []
  })
}


function onRequestFinished(request: chrome.devtools.network.Request) {
  console.log('onRequestFinished', ...arguments)
  if (!navigations.value.length) navigate('init')
  const navigation = navigations.value[navigations.value.length - 1]
  navigation.requests.push(request);
}

function onNavigated(url: string) {
  console.log('onNavigated', ...arguments)
  navigate(url)
}

chrome.devtools.network.onNavigated.addListener(onNavigated)
chrome.devtools.network.onRequestFinished.addListener(onRequestFinished);

function setupContents() {
  requests.value.forEach(request => {
    if (contents.value.has(request)) return
    if (request.response.content.mimeType !== 'application/json') return
    contents.value.set(request, undefined);
    request.getContent((content, encoding) => {
      contents.value.set(request, { 
        content: isJSON(content) ? JSON.parse(content) : undefined, 
        encoding: encoding,
      });  
    })
  })
}

const isOpenAPI = (data: any) => isObjectLike(data) && (data.openapi || data.swagger)
watch(() => requests.value.length, setupContents, { immediate: true })

export function useNetwork() {
  return {
    requests,
    records,
    openapis: computed(() => records.value.filter(record => isOpenAPI(record.content)))
  }
}