import { FileData } from "@/types/file"

export type GenResult<S = void> = S extends { [key: string]: number } ? {
  files: FileData[]
  statistic: S
} : { files: FileData[] }