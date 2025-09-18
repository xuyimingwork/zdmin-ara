import { getCommentMultiLine } from "@/transform/comment";

export function patchBanner(content: string) {
  return `${getCommentMultiLine([
    '本文件由 OpenAPI CodeGen 自动生成，请不要直接修改'
  ])}\n\n${content}`
}