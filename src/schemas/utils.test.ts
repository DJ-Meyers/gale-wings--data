import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { uniqueArraySchema } from './utils'

describe('uniqueArraySchema', () => {
  const stringSchema = uniqueArraySchema(z.string())

  it('accepts an empty array', () => {
    expect(stringSchema.safeParse([]).success).toBe(true)
  })

  it('accepts a single-item array', () => {
    expect(stringSchema.safeParse(['a']).success).toBe(true)
  })

  it('accepts unique entries', () => {
    expect(stringSchema.safeParse(['a', 'b', 'c']).success).toBe(true)
  })

  it('rejects duplicate entries', () => {
    const result = stringSchema.safeParse(['a', 'b', 'a'])
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('All entries must be unique')
    }
  })

  it('rejects entries that fail the inner schema', () => {
    const numberSchema = uniqueArraySchema(z.number())
    expect(numberSchema.safeParse([1, 2, 'three']).success).toBe(false)
  })

  it('rejects a non-array input', () => {
    expect(stringSchema.safeParse('not an array').success).toBe(false)
  })
})
