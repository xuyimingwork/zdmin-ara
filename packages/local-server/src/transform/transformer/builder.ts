// createTransformer()
//   .when({  }, () => ({}))
//   .when({  }, () => ({}))
//   .default() // others
//   .build()

import { UserApiTransformer } from "@/types/option"
import { get } from "es-toolkit/compat"

type MatcherTarget = {
  method?: string | RegExp
  path?: string | RegExp
  doc?: string | RegExp | { 
    name?: string | RegExp 
    url?: string | RegExp
  }
}
type MatcherFunction = ((...args: Parameters<UserApiTransformer>) => boolean)
type Matcher = MatcherTarget | MatcherFunction

function match(matcher: MatcherTarget, options: Parameters<UserApiTransformer>['0']) {
  const { doc, ...base } = matcher
  const items: { key: string, value: string | RegExp }[] = []
  items.push(...Object.keys(base).map(key => ({ key, value: base[key] })))
  if (doc) items.push(...(typeof doc === 'string' || doc instanceof RegExp 
    ? [{ key: 'doc.name', value: doc }]
    : Object.keys(base).map(key => ({ key: `doc.${key}`, value: base[key] }))
  ))
  // 不进行空匹配，空匹配使用 default
  if (!items.length) return false
  return items.every(item => {
    const value = get(options, item.key)
    if (item.value instanceof RegExp && typeof value === 'string') return item.value.test(value)
    return value === item.value
  })
}

export function createTransformerBuilder() {
  const cases: { 
    matcher?: Matcher, 
    transformers: UserApiTransformer[] 
  }[] = []
  function when(matcher: Matcher, ...transformers: UserApiTransformer[]) {
    cases.push({ matcher, transformers })
    return {
      when,
      default: _default,
      build
    }
  }
  function _default(...transformers: UserApiTransformer[]): UserApiTransformer {
    cases.push({ transformers })
    return build()
  }
  function build(): UserApiTransformer {
    return (options) => {
      const matched = cases.find(item => {
        const matcher = item.matcher
        if (typeof matcher === 'function') return matcher(options)
        if (typeof matcher === 'object' && !!matcher) return match(matcher, options)
        if (!matcher) return true
        return false
      })
      if (!matched) return { ignore: true }
      return Object.assign({}, ...matched.transformers.map(transformer => transformer(options)))
    }
  }
  return {
    when, 
    default: _default,
    build,
  }
}