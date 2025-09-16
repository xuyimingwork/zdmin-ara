import { mergeConfig } from "vite";
import viteConfig from "./vite.config";
import { fileURLToPath } from "node:url";

export default mergeConfig(viteConfig, { 
  build: {
    outDir: 'dist-dev',
    lib: {
      entry: fileURLToPath(new URL('./src/run.ts', import.meta.url)),
    },
  },
})