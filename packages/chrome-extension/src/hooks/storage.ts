import { tryOnUnmounted } from "@vueuse/core";
import { upperFirst } from "es-toolkit";
import { useAsync, useAsyncData } from "vue-asyncx";

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
    return new Promise((resolve) => {
      chrome.storage.local.get(key).then((result) => {
        console.log("storage get", key, result);
        resolve(result[key])
      });
    })
  }, { 
    initialData: initialValue, 
    immediate: true 
  })

  const { update, updateLoading } = useAsync('update', function update(value: T) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value })
        .then((...args) => {
          console.log("storage set", key, value, ...args);
          return queryData()
        })
        .then(resolve);
    })
  })

  const { remove, removeLoading } = useAsync('remove', function remove(value: T) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key)
        .then((...args) => {
          console.log("storage remove", key, value, ...args);
          return queryData()
        })
        .then(resolve);
    })
  })
  
  function onChange(changes: object, areaName: string) {
    console.log('onChange', changes, areaName)
  }

  chrome.storage.onChanged.addListener(onChange)

  tryOnUnmounted(() => chrome.storage.onChanged.removeListener(onChange))
  

  return {
    [key]: data,
    [`update${upperFirst(key)}`]: update, 
    [`remove${upperFirst(key)}`]: remove, 
    [`query${upperFirst(key)}Loading`]: queryDataLoading,
    [`update${upperFirst(key)}Loading`]: updateLoading, 
    [`remove${upperFirst(key)}Loading`]: removeLoading, 
  } as any
}