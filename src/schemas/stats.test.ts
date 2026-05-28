import { describe, expect, it } from 'vitest'

import {
  boostsSchema,
  natureSchema,
  statKeySchema,
  statKeyWithoutHpSchema,
  statPointsSchema,
} from './stats'

describe('statKeySchema', () => {
  it.each(['hp', 'atk', 'def', 'spa', 'spd', 'spe'])(
    'should accept %s',
    (k) => {
      expect(statKeySchema.safeParse(k).success).toBe(true)
    },
  )

  it.each(['special', 'speed', 'HP', 'foo'])('should reject %s', (k) => {
    expect(statKeySchema.safeParse(k).success).toBe(false)
  })
})

describe('statKeyWithoutHpSchema', () => {
  it.each(['atk', 'def', 'spa', 'spd', 'spe'])('should accept %s', (k) => {
    expect(statKeyWithoutHpSchema.safeParse(k).success).toBe(true)
  })

  it('should reject hp', () => {
    expect(statKeyWithoutHpSchema.safeParse('hp').success).toBe(false)
  })
})

describe('statPointsSchema', () => {
  const fullZero = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }

  it('should accept all-zero stat points', () => {
    expect(statPointsSchema.safeParse(fullZero).success).toBe(true)
  })

  it('should accept a distribution totalling less than 66', () => {
    expect(
      statPointsSchema.safeParse({
        hp: 2,
        atk: 30,
        def: 0,
        spa: 0,
        spd: 0,
        spe: 32,
      }).success,
    ).toBe(true)
  })

  it('should accept a distribution totalling exactly 66', () => {
    expect(
      statPointsSchema.safeParse({
        hp: 2,
        atk: 32,
        def: 0,
        spa: 0,
        spd: 0,
        spe: 32,
      }).success,
    ).toBe(true)
  })

  it('should reject a distribution exceeding 66', () => {
    expect(
      statPointsSchema.safeParse({
        hp: 32,
        atk: 32,
        def: 32,
        spa: 0,
        spd: 0,
        spe: 0,
      }).success,
    ).toBe(false)
  })

  it('should reject a single stat above 32', () => {
    expect(statPointsSchema.safeParse({ ...fullZero, atk: 33 }).success).toBe(
      false,
    )
  })

  it('should reject a negative stat', () => {
    expect(statPointsSchema.safeParse({ ...fullZero, hp: -1 }).success).toBe(
      false,
    )
  })

  it('should reject a non-integer value', () => {
    expect(statPointsSchema.safeParse({ ...fullZero, hp: 1.5 }).success).toBe(
      false,
    )
  })

  it('should reject an unknown stat key', () => {
    expect(
      statPointsSchema.safeParse({ ...fullZero, special: 4 }).success,
    ).toBe(false)
  })
})

describe('boostsSchema', () => {
  const fullZero = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }

  it.each([-6, -3, 0, 3, 6])('should accept in-range boost %d', (v) => {
    expect(boostsSchema.safeParse({ ...fullZero, atk: v }).success).toBe(true)
  })

  it.each([-7, 7, 99])('should reject out-of-range boost %d', (v) => {
    expect(boostsSchema.safeParse({ ...fullZero, atk: v }).success).toBe(false)
  })

  it('should reject a non-integer boost', () => {
    expect(boostsSchema.safeParse({ ...fullZero, atk: 1.5 }).success).toBe(
      false,
    )
  })

  it('should reject an hp key (HP is not boostable)', () => {
    expect(boostsSchema.safeParse({ ...fullZero, hp: 0 }).success).toBe(false)
  })
})

describe('natureSchema', () => {
  it.each(['Serious', 'Adamant', 'Jolly', 'Modest', 'Timid'])(
    'should accept nature %s',
    (n) => {
      expect(natureSchema.safeParse(n).success).toBe(true)
    },
  )

  it.each(['adamant', 'invalid', 'Hardy'])(
    'should reject non-nature %s',
    (n) => {
      expect(natureSchema.safeParse(n).success).toBe(false)
    },
  )

  it('should default to "Serious" when undefined', () => {
    // Zod treats an explicit `undefined` as the trigger for its default value,
    // which `parse()` with no args does not — keep the explicit `undefined`.
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(natureSchema.parse(undefined)).toBe('Serious')
  })
})
