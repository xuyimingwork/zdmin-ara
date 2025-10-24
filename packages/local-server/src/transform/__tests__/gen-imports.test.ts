import { normalizeImports } from '@/transform/gen-imports'
import { describe, it, expect } from 'vitest'

describe('gen-imports single', () => {
  it('empty', async () => {
    const result = normalizeImports([])
    expect(result).toEqual([])
  })

  it(`import 'vue'`, async () => {
    const result = normalizeImports(['vue'])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ mode: 'simple', from: 'vue' })
  })

  it(`import Vue from 'vue'`, async () => {
    const result = normalizeImports([{ from: 'vue', import: 'Vue' }])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ mode: 'default', from: 'vue', alias: 'Vue' })
  })

  it(`import * as Vue from 'vue'`, async () => {
    const result = normalizeImports([{ from: 'vue', imports: [{ name: '*', alias: 'Vue' }] }])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ mode: 'star', from: 'vue', alias: 'Vue' })
  })

  it(`import { ref } from 'vue'`, async () => {
    const result = normalizeImports([{ from: 'vue', imports: [{ name: 'ref' }] }])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ mode: 'common', from: 'vue', imports: [{ name: 'ref' }] })
  })

  it(`import { ref as myRef } from 'vue'`, async () => {
    const result = normalizeImports([{ from: 'vue', imports: [{ name: 'ref', alias: 'myRef' }] }])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ mode: 'common', from: 'vue', imports: [{ name: 'ref', alias: 'myRef' }] })
  })

  it(`import { type Ref } from 'vue'`, async () => {
    const result = normalizeImports([{ from: 'vue', imports: [{ name: 'Ref', type: true }] }])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ mode: 'type', from: 'vue', imports: [{ name: 'Ref' }] })
  })

  it(`import { type Ref as MyRef } from 'vue'`, async () => {
    const result = normalizeImports([{ from: 'vue', imports: [{ name: 'Ref', alias: 'MyRef', type: true }] }])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ mode: 'type', from: 'vue', imports: [{ name: 'Ref', alias: 'MyRef' }] })
  })
})

describe('gen-imports repeat', () => {
  it(`multi import 'vue'`, async () => {
    const result = normalizeImports(['vue', 'vue'])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ mode: 'simple', from: 'vue' })
  })

  it(`multi import * as Vue from 'vue'`, async () => {
    const result = normalizeImports([
      { from: 'vue', imports: [{ name: '*', alias: 'Vue' }] },
      { from: 'vue', imports: [{ name: '*', alias: 'Vue' }] }
    ])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ mode: 'star', from: 'vue', alias: 'Vue' })
  })

  it(`multi import { ref } from 'vue'`, async () => {
    const result = normalizeImports([
      { from: 'vue', imports: [{ name: 'ref' }, { name: 'ref' }, 'ref'] },
      { from: 'vue', imports: [{ name: 'ref' }] }
    ])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ mode: 'common', from: 'vue', imports: [{ name: 'ref' }] })
  })
})
