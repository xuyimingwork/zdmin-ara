import { mergeConfig } from "vite";
import viteConfig from "./vite.config";
import { fileURLToPath } from "node:url";

export default mergeConfig(viteConfig, { 
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/dev.ts', import.meta.url)),
    },
  },
})