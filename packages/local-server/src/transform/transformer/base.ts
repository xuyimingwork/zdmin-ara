import { ApiTransformer } from "@/types/api"
import { kebabCase } from "@/utils/string"
import { camelCase } from "es-toolkit"
import { basename, dirname, normalize } from "path"

type PresetApiTransformer = (options: Omit<Parameters<ApiTransformer>[0], 'base'>) => Required<ReturnType<ApiTransformer>>

export const baseTransformer: PresetApiTransformer = ({ path, method, refs }) => {
  const base = basename(path)
  const dir = dirname(path).startsWith('/')
    ? dirname(path).substring(1)
    : dirname(path)
  const output = normalize(dir || 'index').split('/').map(item => kebabCase(item)).join('/') + '.ts'
  return {
    output: output.startsWith('/') ? output.substring(1) : output,
    name: camelCase(`${method}+${base}`),
    code: '',
    ignore: false,
    parameters: [{ 
      name: 'options',
      type: refs.types.RequestOptions,
      optional: true
    }],
    imports: [],
    types: {
      return: `Promise<${refs.types.Response}>`
    },
    debug: false
  }
}