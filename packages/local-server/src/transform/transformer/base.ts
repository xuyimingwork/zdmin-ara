import { ApiBaseData, ApiTransformer } from "@/types/api"
import { kebabCase } from "@/utils/string"
import { camelCase } from "es-toolkit"
import { basename, dirname, normalize } from "path"

type PresetApiTransformer = (options: ApiBaseData) => Required<ReturnType<ApiTransformer>>

export const baseTransformer: PresetApiTransformer = ({ path, method }) => {
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
    arguments: [],
    imports: [],
    types: {},
    debug: false
  }
}