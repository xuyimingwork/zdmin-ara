import { tryOnUnmounted } from "@vueuse/core";
import { isJSON, upperFirst } from "es-toolkit";
import { useAsync, useAsyncData } from "vue-asyncx";

const storage = chrome.storage 
  ? { 
    get: (key: string) => {
      // chrome.storage.local 无法正确存储数组，使用 json 转换 
      return chrome.storage.local.get(key).then(result => isJSON(result[key]) ? JSON.parse(result[key]) : undefined)
    },
    set: (key: string, value: any) => {
      // chrome.storage.local 无法正确存储数组，使用 json 转换
      return chrome.storage.local.set({ [key]: JSON.stringify(value) })
    },
    remove: (key: string) => chrome.storage.local.remove(key)
  }
  : { 
    get: (key: string) => new Promise((resolve) => {
      const value = localStorage.getItem(key)
      if (!value) return resolve(undefined)
      return resolve(JSON.parse(value))
    }),
    set: (key: string, value: any) => new Promise((resolve) => {
      const item = JSON.stringify(value)
      localStorage.setItem(key, item)
      resolve(value)
    }),
    remove: (key: string) => new Promise((resolve) => {
      localStorage.removeItem(key)
      resolve(undefined)
    })
  }

/**
 * 
 * @param key 
 * @param initialValue 
 * @returns 
 */
export function useStorage<N extends string = any, T = any>(key: N, initialValue?: T): {
  [K in N]: Ref<T>
} & {
  [K in `update${Capitalize<N>}`]: (v: T) => Promise<void>
} & {
  [K in `remove${Capitalize<N>}`]: () => Promise<void>
} & {
  [K in `query${Capitalize<N>}Loading`]: Ref<boolean>
} & {
  [K in `update${Capitalize<N>}Loading`]: Ref<boolean>
} & {
  [K in `remove${Capitalize<N>}Loading`]: Ref<boolean>
} {
  const { data, queryData, queryDataLoading } = useAsyncData(() => {
    return storage.get(key)
  }, { 
    initialData: initialValue, 
    immediate: true 
  })

  const { update, updateLoading } = useAsync('update', function update(value: T) {
    return storage.set(key, value)
  })

  const { remove, removeLoading } = useAsync('remove', function remove() {
    return storage.remove(key)
  })
  
  function onChange(changes: object, areaName: string) {
    if (areaName !== 'local') return
    if (!changes || !(key in changes)) return
    queryData()
  }

  chrome.storage?.onChanged.addListener(onChange)
  tryOnUnmounted(() => chrome.storage?.onChanged.removeListener(onChange))

  return {
    [key]: data,
    [`update${upperFirst(key)}`]: update, 
    [`remove${upperFirst(key)}`]: remove, 
    [`query${upperFirst(key)}Loading`]: queryDataLoading,
    [`update${upperFirst(key)}Loading`]: updateLoading, 
    [`remove${upperFirst(key)}Loading`]: removeLoading, 
  } as any
}