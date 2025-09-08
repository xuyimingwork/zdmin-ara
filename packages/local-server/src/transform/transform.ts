import ts from 'typescript'
import { camelCase, groupBy } from 'es-toolkit/compat'
import { kebabCase } from 'es-toolkit'
import { createFunctionDeclaration } from '@/transform/function'
import { output } from '@/transform/printer'
import { getCommentMultiLine } from '@/transform/comment'
// import { createDefinitionsInterfaceDeclaration } from '@/transform/type'
import v3OpenAPITS, { astToString as v3AstToString } from "openapi-typescript7";
import v2OpenAPITS from "openapi-typescript5";

const factory = ts.factory

function resolve({ path, data }): { file, function, data }[] {
  const dir = path.slice(0, path.lastIndexOf('/'))
  const file = dir.split('/').length > 1 
    ? dir.slice(0, dir.lastIndexOf('/') + 1) + kebabCase(dir.slice(dir.lastIndexOf('/') + 1)) + '.ts'
    : kebabCase(dir) + '.ts'
  return Object.keys(data).map((httpMethod, i) => {
    return {
      file,
      function: camelCase(path.slice(path.lastIndexOf('/') + 1)) + (i ? i : ''),
      data: { ...data[httpMethod], _key: httpMethod },
    }
  })
}

function patchBanner(content: string) {
  return `${getCommentMultiLine([
    '本文件由 OpenAPI CodeGen 自动生成，请不要直接修改'
  ])}\n\n${content}`
}

function genRequests({ openapi }) {
  // TODO: 剔除代码分文件逻辑
  const files = groupBy(Object.keys(openapi.paths).map(path => {
    const data = openapi.paths[path]
    return resolve({ path, data }).map(item => ({ ...item, path }))
  }).flat(), item => item.file)

  const statistic = { functions: 0 }

  const outputFiles = Object.keys(files).map(file => {
    const functions = files[file].map(item => {
      return createFunctionDeclaration({ 
        name: item.function, 
        path: item.path, 
        method: item.data._key,
        context: item.data
      })
    }).flat().map(node => [node, factory.createIdentifier('\n')]).flat()
    
    statistic.functions += functions.length
    const content = output(factory.createNodeArray(functions))

    return {
      file,
      content: patchBanner(content)
    }
  })

  return { files: outputFiles, statistic }
}

async function genTypes({ openapi }) {
  // const definitions = createDefinitionsInterfaceDeclaration({ openapi })
  // const content = output(factory.createNodeArray([definitions].filter(item => !!item)))
  if (openapi.swagger) return {
    files: [{
      file: 'types.d.ts',
      content: await v2OpenAPITS(openapi, { commentHeader: patchBanner('') })
    }]
  }
  if (openapi.openapi) return {
    files: [{
      file: 'types.d.ts',
      content: patchBanner(v3AstToString(await v3OpenAPITS(openapi)))
    }]
  }
}

export async function transform({ openapi }) {
  const {
    files: fileOfTypes = [],  
  } = await genTypes({ openapi }) || {}

  const { 
    files: fileOfRequests, 
    statistic: { functions: countOfFunctions } 
  } = genRequests({ openapi })
  
  return {
    files: [
      ...fileOfTypes,
      ...fileOfRequests
    ],
    count: countOfFunctions
  } 
}
