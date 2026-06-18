import { describe, expect, it } from 'vitest'

import { statPointToEv, statPointsToEvs } from './stat-points.js'

describe('statPointToEv', () => {
  it('maps 0 SP to 0 EV', () => {
    expect(statPointToEv(0)).toBe(0)
  })

  it('maps 1 SP to 4 EV (first point is worth 4, not 8)', () => {
    expect(statPointToEv(1)).toBe(4)
  })

  it('maps 3 SP to 20 EV (4 + 2*8)', () => {
    expect(statPointToEv(3)).toBe(20)
  })

  it('maps 24 SP to 188 EV (4 + 23*8) — user spot-check', () => {
    expect(statPointToEv(24)).toBe(188)
  })

  it('maps 32 SP to 252 EV (cap)', () => {
    expect(statPointToEv(32)).toBe(252)
  })
})

describe('statPointsToEvs', () => {
  it('converts every stat key independently', () => {
    expect(
      statPointsToEvs({ hp: 0, atk: 1, def: 3, spa: 32, spd: 2, spe: 0 }),
    ).toEqual({ hp: 0, atk: 4, def: 20, spa: 252, spd: 12, spe: 0 })
  })
})
