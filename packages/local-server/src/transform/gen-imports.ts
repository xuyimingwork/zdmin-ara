import { AstInputImport, AstInputImportDefault, AstInputImportMix, AstInputImportNormalized } from "@/types"
import { isObjectLike } from "es-toolkit/compat"
import { factory, ImportDeclaration } from "typescript"

export function normalizeImports(imports: AstInputImport[]): AstInputImportNormalized[] {
  const map = new Map<string, AstInputImportNormalized[]>()

  const prepare = (from: string) => !map.has(from) && map.set(from, [])
  const prepareType = (from: string) => {
    if (getTypeImports(from)) return
    map.get(from)?.push({ mode: 'type', from, imports: [] })
  }
  const prepareCommon = (from: string) => {
    if (getCommonImports(from)) return
    map.get(from)?.push({ mode: 'common', from, imports: [] })
  }

  const hasSimple = (from: string) => !!map.get(from)?.find(one => one.mode === 'simple')
  const hasDefault = (from: string, alias: string) => map.get(from)?.find(one => one.mode === 'default' && one.alias === alias)
  const hasStar = (from: string, alias: string) => map.get(from)?.find(one => one.mode === 'star' && one.alias === alias)
  const hasCommonImport = (from: string, name: string, alias?: string) => map.get(from)?.find(one => {
    if (one.mode !== 'common') return false
    return !!one.imports.find(item => item.name === name && item.alias === alias)
  })
  const getCommonImports = (from: string) => map.get(from)?.find(one => one.mode === 'common')?.imports
  const hasTypeImport = (from: string, name: string, alias?: string) => map.get(from)?.find(one => {
    if (one.mode !== 'type') return false
    return !!one.imports.find(item => item.name === name && item.alias === alias)
  })
  const getTypeImports = (from: string) => map.get(from)?.find(one => one.mode === 'type')?.imports
  const isAstInputImportDefault = (item: AstInputImport): item is AstInputImportDefault => isObjectLike(item) && !!(item as AstInputImportDefault).import
  const isAstInputImportMix = (item: AstInputImport): item is AstInputImportMix => isObjectLike(item) && Array.isArray((item as AstInputImportMix).imports)
  
  imports.forEach(item => {
    if (typeof item === 'string') {
      prepare(item)
      if (hasSimple(item)) return
      return map.get(item)?.push({ mode: 'simple', from: item })
    }
    
    if (isAstInputImportDefault(item)) {
      prepare(item.from)
      if (hasDefault(item.from, item.import)) return
      return map.get(item.from)?.push({ mode: 'default', alias: item.import, from: item.from })
    }
    
    if (isAstInputImportMix(item)) {
      prepare(item.from)
      item.imports.forEach((part) => {
        if (typeof part === 'string') {
          if (hasCommonImport(item.from, part)) return
          prepareCommon(item.from)
          return getCommonImports(item.from)!.push({ name: part })
        }
        if (isObjectLike(part) && part.type) {
          if (hasTypeImport(item.from, part.name, part.alias)) return
          prepareType(item.from)
          return getTypeImports(item.from)!.push({ name: part.name, alias: part.alias })
        }
        if (isObjectLike(part) && !part.type && part.name === '*') {
          if (!part.alias || hasStar(item.from, part.alias)) return
          return map.get(item.from)?.push({ mode: 'star', alias: part.alias, from: item.from })
        }
        if (isObjectLike(part) && !part.type && part.name !== '*') {
          if (hasCommonImport(item.from, part.name, part.alias)) return
          prepareCommon(item.from)
          return getCommonImports(item.from)!.push({ name: part.name, alias: part.alias })
        }
      })
    }
  })

  return [...map.keys()].sort().map(from => map.get(from)!.map(item => ({ ...item, from }))).flat()
}

export function genImports(imports?: AstInputImportNormalized[]): ImportDeclaration[] {
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