import { describe, expect, it } from 'vitest'

import { defaultHits, multiHitRange } from './multi-hit.js'

describe('multiHitRange', () => {
  it('returns the [min, max] for variable multi-hit moves (Icicle Spear)', () => {
    expect(multiHitRange('Icicle Spear')).toEqual([2, 5])
    expect(multiHitRange('Bullet Seed')).toEqual([2, 5])
  })

  it('treats a fixed / up-to-N count as 1..N (Population Bomb, Triple Axel)', () => {
    expect(multiHitRange('Population Bomb')).toEqual([1, 10])
    expect(multiHitRange('Triple Axel')).toEqual([1, 3])
    expect(multiHitRange('Double Hit')).toEqual([1, 2])
  })

  it('returns null for single-hit moves and unknown / empty names', () => {
    expect(multiHitRange('Moonblast')).toBeNull()
    expect(multiHitRange('Definitely Not A Move')).toBeNull()
    expect(multiHitRange('')).toBeNull()
  })
})

describe('defaultHits', () => {
  it('reports the calc default hit count (3 for a [2,5] move)', () => {
    expect(defaultHits('Icicle Spear')).toBe(3)
    expect(defaultHits('Population Bomb')).toBe(10)
    expect(defaultHits('Triple Axel')).toBe(3)
  })

  it('reports 1 for single-hit moves and empty names', () => {
    expect(defaultHits('Moonblast')).toBe(1)
    expect(defaultHits('')).toBe(1)
  })
})
