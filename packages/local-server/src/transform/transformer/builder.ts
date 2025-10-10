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

interface Builder {
  (options?: {
    baseTransformer?: UserApiTransformer
  }): {
    when: When,
    default: (transform: UserApiTransformer) => UserApiTransformer
    build: () => UserApiTransformer
  }
}

interface When {
  (matcher: Matcher, transform: UserApiTransformer): ReturnType<Builder>
}

/**
 * @example 
 * {
 *   transform: createTransformBuilder()
 *                .when({ method: 'get' }, () => ({  }))
 *                .when({ doc: 'pet-v2' }, () => ({  }))
 *                .build()
 * }
 */
export function createTransformBuilder({
  baseTransformer = () => ({})
}: {
  baseTransformer?: UserApiTransformer
} = {}): ReturnType<Builder> {
  const cases: { 
    matcher?: Matcher, 
    transform: UserApiTransformer
  }[] = []
  function when(matcher: Matcher, transform: UserApiTransformer): ReturnType<When> {
    cases.push({ matcher, transform })
    return {
      when,
      default: _default,
      build
    }
  }
  function _default(transform: UserApiTransformer): UserApiTransformer {
    cases.push({ transform })
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
      const base = baseTransformer(options)
      return Object.assign({}, base, matched.transform({
        ...options,
        base: Object.assign({}, options.base, base)
      })) 
    }
  }
  return {
    when, 
    default: _default,
    build,
  }
}