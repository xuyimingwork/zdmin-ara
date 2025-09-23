import { main } from "@/app";
import { resolve } from "path";

main({ 
  // 输出文件不会在该目录之外
  outDir: resolve(process.cwd(), 'temp'),
  doc: {
    v2: 'https://192.168.8.186/gateway/gpx-document/doc.html#/home',
    v3: 'http://192.168.8.186:8080/gpx-ruoyi-flex/swagger-ui/index.html?urls.primaryName=6.%E8%84%9A%E6%9C%AC%E7%94%9F%E6%88%90%E6%A8%A1%E5%9D%97#/'
  }
})
  .then(({ port }: any) => {
    console.log(`Local server is running on http://localhost:${port}`);
  })