import axios, { type AxiosRequestConfig } from "axios";
import { merge } from "es-toolkit/compat";
import get from "es-toolkit/compat/get";

interface RequestOptions<D = any> extends AxiosRequestConfig<D> {
  ara?: {
    silent?: boolean,
    response?: {
      path?: string
    }
  }
}

export function request<D = any>(options: RequestOptions<D>) {
  const instance = axios.create()
  options = merge({}, {
    method: 'get',
    ara: {
      silent: false,
      response: {
        path: 'data.data'
      }
    }
  } as Partial<RequestOptions>, options)
  instance.interceptors.response.use(res => {
    const path = get(res.config, 'ara.response.path')
    return path ? get(res, path) : res
  })
  const p = instance.request(options)
  p.catch(e => !get(options, 'ara.silent') && ElMessage.error(e.message || '请求失败'))
  return p
}