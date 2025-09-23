import { writeFile } from "fs/promises"
import { mkdirp } from "mkdirp"
import { dirname } from "path"

export function writep(output: string, content: string): Promise<void> {
  const dir = dirname(output)
  return mkdirp(dir).then(() => writeFile(output, content, 'utf8'))
}