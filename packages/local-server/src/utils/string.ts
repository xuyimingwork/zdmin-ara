import { kebabCase as _kebabCase } from "es-toolkit"
export const kebabCase = (str: string) => _kebabCase(str).replace(/-(\d)/g, '$1')