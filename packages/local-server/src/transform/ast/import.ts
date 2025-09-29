import type { ImportDataNormalized } from "@/types/import"
import type { ImportDeclaration } from "typescript"
import ts from "typescript"

const factory = ts.factory

export function createImportDeclarations(imports?: ImportDataNormalized[]): ImportDeclaration[] {
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
  }).filter(item => !!item)
}