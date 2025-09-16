import { isJSON } from "es-toolkit";
import { isObjectLike } from "es-toolkit/compat";

// 请求内容对应响应详情
const contents = ref<WeakMap<chrome.devtools.network.Request, { content: any, encoding: string } | undefined>>(new WeakMap())
// 每次导航发起后对应的请求
const navigations = ref<Array<{ 
  url: string 
  timestamp: number
  requests: chrome.devtools.network.Request[]
}>>([])
// network 面板请求内容
const requests = computed(() => navigations.value.map(({ requests }) => requests).flat());
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
    if (request.response.content.mimeType !== 'application/json') return
    if (contents.value.has(request)) return
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
    openapis: computed(() => requests.value
      .filter(item => contents.value.has(item))
      .filter(item => contents.value.get(item))
      .filter(item => contents.value.get(item)!.content)
      .filter(item => isOpenAPI(contents.value.get(item)!.content))
    )
  }
}