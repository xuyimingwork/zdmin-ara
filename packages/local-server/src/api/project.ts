import { DocNormalized, UserOptionsNormalized } from "@/types";

export function getProject(options: UserOptionsNormalized): { path: string, outDir: string, docs: Array<DocNormalized> } {
  return {
    path: options.cwd,
    outDir: options.outDir,
    docs: options.doc
  }
}