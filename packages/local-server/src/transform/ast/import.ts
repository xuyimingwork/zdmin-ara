import type { ImportDataNormalized, ImportDataNormalizedType } from "@/types/import"
import { groupBy } from "es-toolkit"
import type { ImportDeclaration, JSDoc, NamedImports } from "typescript"
import { factory } from "typescript"

export function createImportDeclarations(imports?: ImportDataNormalized[]): (ImportDeclaration | JSDoc)[] {
  if (!Array.isArray(imports)) return []

  const {
    normal: normalImports,
    jsdoc: jsdocImports
  } = groupBy(imports, (_import) => _import.mode === 'type' && _import.jsdoc ? 'jsdoc' : 'normal')

  return [
    ...createNormalImportDeclarations(normalImports),
    createJsdocImportDeclarations(jsdocImports as ImportDataNormalizedType[])
  ].filter(item => !!item)
}

function createNormalImportDeclarations(imports?: ImportDataNormalized[]): ImportDeclaration[] {
  if (!Array.isArray(imports)) return []
  return imports.map(item => {
    if (item.mode === 'simple') return factory.createImportDeclaration(
      undefined,
      undefined,
      factory.createStringLiteral(item.from),
      undefined
    )
    if (item.mode === 'default') return factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        factory.createIdentifier(item.alias),
        undefined
      ),
      factory.createStringLiteral(item.from),
      undefined
    )
    if (item.mode === 'star') return factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamespaceImport(factory.createIdentifier(item.alias))
      ),
      factory.createStringLiteral(item.from),
      undefined
    )
    // 可能超行
    if (item.mode === 'common') return factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        createNamedImportBindings(item.imports)
      ),
      factory.createStringLiteral(item.from),
      undefined
    )
    // 可能超行
    if (item.mode === 'type') return factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        true,
        undefined,
        createNamedImportBindings(item.imports)
      ),
      factory.createStringLiteral(item.from),
      undefined
    )
  }).filter(item => !!item)
}

function createJsdocImportDeclarations(imports?: ImportDataNormalizedType[]): JSDoc | undefined {
  if (!Array.isArray(imports) || !imports.length) return
  return factory.createJSDocComment(undefined, imports.map((item) =>
    factory.createJSDocImportTag(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        createNamedImportBindings(item.imports)
      ),
      factory.createStringLiteral(item.from),
      undefined
    )
  ))
}

function createNamedImportBindings(imports: ImportDataNormalizedType['imports']): NamedImports | undefined {
  if (!Array.isArray(imports)) return
  const importSpecifiers = imports.map(item => item.alias ? factory.createImportSpecifier(
    false,
    factory.createIdentifier(item.name),
    factory.createIdentifier(item.alias)
  ) : factory.createImportSpecifier(
    false,
    undefined,
    factory.createIdentifier(item.name)
  ))
  return factory.createNamedImports(importSpecifiers)
}