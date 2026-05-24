import { describe, expect, it } from 'vitest'

import {
  statAlignmentSchema,
  statBoostsSchema,
  statKeySchema,
  statPointsSchema,
} from './stats'

describe('statKeySchema', () => {
  it.each(['hp', 'atk', 'def', 'spa', 'spd', 'spe'])('accepts %s', (k) => {
    expect(statKeySchema.safeParse(k).success).toBe(true)
  })

  it.each(['special', 'speed', 'HP', 'foo'])('rejects %s', (k) => {
    expect(statKeySchema.safeParse(k).success).toBe(false)
  })
})

describe('statPointsSchema', () => {
  const fullZero = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }

  it('accepts all-zero stat points', () => {
    expect(statPointsSchema.safeParse(fullZero).success).toBe(true)
  })


  it('accepts a distribution totalling less than 66', () => {
    expect(
      statPointsSchema.safeParse({ hp: 2, atk: 30, def: 0, spa: 0, spd: 0, spe: 32 }).success,
    ).toBe(true)
  })

  it('accepts a distribution totalling exactly 66', () => {
    expect(
      statPointsSchema.safeParse({ hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }).success,
    ).toBe(true)
  })

  it('rejects a distribution exceeding 66', () => {
    expect(
      statPointsSchema.safeParse({ hp: 32, atk: 32, def: 32, spa: 0, spd: 0, spe: 0 }).success,
    ).toBe(false)
  })

  it('rejects a single stat above 32', () => {
    expect(statPointsSchema.safeParse({ ...fullZero, atk: 33 }).success).toBe(false)
  })

  it('rejects a negative stat', () => {
    expect(statPointsSchema.safeParse({ ...fullZero, hp: -1 }).success).toBe(false)
  })

  it('rejects a non-integer value', () => {
    expect(statPointsSchema.safeParse({ ...fullZero, hp: 1.5 }).success).toBe(false)
  })

  it('rejects an unknown stat key', () => {
    expect(statPointsSchema.safeParse({ ...fullZero, special: 4 }).success).toBe(false)
  })
})

describe('statBoostsSchema', () => {
  const fullZero = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }

  it.each([-6, -3, 0, 3, 6])('accepts in-range boost %d', (v) => {
    expect(statBoostsSchema.safeParse({ ...fullZero, atk: v }).success).toBe(true)
  })

  it.each([-7, 7, 99])('rejects out-of-range boost %d', (v) => {
    expect(statBoostsSchema.safeParse({ ...fullZero, atk: v }).success).toBe(false)
  })

  it('rejects a non-integer boost', () => {
    expect(statBoostsSchema.safeParse({ ...fullZero, atk: 1.5 }).success).toBe(false)
  })
})

describe('statAlignmentSchema', () => {
  it.each(['serious', 'adamant', 'jolly', 'modest', 'timid'])(
    'accepts nature %s',
    (n) => {
      expect(statAlignmentSchema.safeParse(n).success).toBe(true)
    },
  )

  it.each(['Adamant', 'invalid', 'hardy'])('rejects non-nature %s', (n) => {
    expect(statAlignmentSchema.safeParse(n).success).toBe(false)
  })

  it('defaults to "serious" when undefined', () => {
    expect(statAlignmentSchema.parse(undefined)).toBe('serious')
  })
})
