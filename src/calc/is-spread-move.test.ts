import { describe, expect, it } from 'vitest'

import { isSpreadMove } from './is-spread-move.js'

describe('isSpreadMove', () => {
  it('returns true for allAdjacent moves (Earthquake)', () => {
    expect(isSpreadMove('Earthquake')).toBe(true)
  })

  it('returns true for allAdjacentFoes moves (Rock Slide)', () => {
    expect(isSpreadMove('Rock Slide')).toBe(true)
  })

  it('returns true for Heat Wave', () => {
    expect(isSpreadMove('Heat Wave')).toBe(true)
  })

  it('returns false for normal-target moves (Close Combat)', () => {
    expect(isSpreadMove('Close Combat')).toBe(false)
  })

  it('returns false for empty move name', () => {
    expect(isSpreadMove('')).toBe(false)
  })

  it('returns false for unknown move names', () => {
    expect(isSpreadMove('Definitely Not A Move')).toBe(false)
  })
})
