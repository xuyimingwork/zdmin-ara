export function normalizePath(path: string, source: string): string {
  return '`' + path.replace(/\/\{(\w+)\}/g, (_, group) => `/\${${source ? `${source}.` : ''}${group}}`) + '`'
}