import { UserDocNormalized, UserOptionsNormalized } from "@/types/option";

export function getProject(options: UserOptionsNormalized): { path: string, outDir: string, docs: Array<UserDocNormalized> } {
  return {
    path: options.cwd,
    outDir: options.outDir,
    docs: options.doc
  }
}