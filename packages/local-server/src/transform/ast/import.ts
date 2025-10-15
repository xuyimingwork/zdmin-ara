import type { ImportDataNormalized, ImportDataNormalizedType } from "@/types/import"
import { groupBy } from "es-toolkit"
import type { ImportDeclaration, JSDoc } from "typescript"
import ts from "typescript"

const factory = ts.factory

export function createImportDeclarations(imports?: ImportDataNormalized[]): (ImportDeclaration | JSDoc)[] {
  if (!Array.isArray(imports)) return []

  const {
    normal: normalImports,
    jsdoc: jsdocImports
  } = groupBy(imports, (_import) => _import.mode === 'type' && _import.jsdoc ? 'jsdoc' : 'normal')

  return [
    ...normalImports.map(item => {
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
      if (item.mode === 'common') return factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          false,
          undefined,
          factory.createNamedImports(
            item.imports.map(item => item.alias ? factory.createImportSpecifier(
              false,
              factory.createIdentifier(item.name),
              factory.createIdentifier(item.alias)
            ) : factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier(item.name)
            ))
          )
        ),
        factory.createStringLiteral(item.from),
        undefined
      )
      if (item.mode === 'type') return factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports(
            item.imports.map(item => item.alias ? factory.createImportSpecifier(
              false,
              factory.createIdentifier(item.name),
              factory.createIdentifier(item.alias)
            ) : factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier(item.name)
            ))
          )
        ),
        factory.createStringLiteral(item.from),
        undefined
      )
    }),
    jsdocImports?.length ? factory.createJSDocComment(undefined, (jsdocImports as ImportDataNormalizedType[]).map((item) => 
      factory.createJSDocImportTag(
        undefined,
        factory.createImportClause(
          false,
          undefined,
          factory.createNamedImports(
            item.imports.map(item => item.alias ? factory.createImportSpecifier(
              false,
              factory.createIdentifier(item.name),
              factory.createIdentifier(item.alias)
            ) : factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier(item.name)
            ))
          )
        ),
        factory.createStringLiteral(item.from),
        undefined
      )
    )) : undefined
  ].filter(item => !!item)
}