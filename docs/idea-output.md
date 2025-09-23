# 多文件场景下生成路径问题

## 多文档是否可以生成在同一目录下？

1. 由于函数静态导入，目录结构/函数名变更将导致所有导入代码报错
2. 由于 1，应该尽可能避免目录结构/函数名变更
3. 因此，最少配置下的新增文档应该尽可能不影响已有文档

- [x] doc 层默认情况下有自身独立的输出路径
- [x] 用户指定 doc 输出路径场景下，由用户自担冲突风险
- [ ] doc 的 `openapi.json` & `openapi.d.ts` 默认文件名为：
  - [ ] `${doc.output}/${doc.name}.openapi.json`；`doc.name` 不存在时，缩减为 `${doc.output}/openapi.json`；`doc.output` 不存在时，缩减为 `${options.output}/openapi.json`
  - [ ] `${doc.output}/${doc.name}.openapi.d.ts`；`doc.name` 不存在时，缩减为 `${doc.output}/openapi.json`；`doc.output` 不存在时，缩减为 `${options.output}/openapi.json`
- [x] 需要更改名字吗？`output` to `outDir`？
- [ ] 除非特殊配置，transform 产生的 output 默认取 `options.output` or `doc.output`？

--- 

- `options.output`：默认情况：`openapi-codegen`
- `doc.output`
  - 绝对路径：使用绝对路径
  - 相对路径：使用 `options.output` + `doc.output`
  - 默认情况：使用 `options.output` + `doc.name`
- `options.transform` 产生的路径：
  - 绝对路径：除非特殊指定，应该相对于 `doc.output` 生成
    - 优势：单文档向多文档演进时，`options.transform` 可以保持不变
    - 不足：`options.transform` 下未和 `options.output` 保持一致有点反直觉？
  - 相对路径：相对于谁？相对于 `doc.output` 下

### 推演从单文档到多文档变化过程

```js
output: api,
doc: a.html
```

变化为：

```js
output: api,
doc: {
  '': a.html
  'b': b.html
}
```

该过程，a 生成内容应保持不变

### 默认输出到 doc 层级 => yes

手段：内部指定 doc 层默认 output，仅在单文档时将 doc.output 指向 options.output

- 新增 api 有明确位置归属，默认情况下不会与原有 api 产生冲突