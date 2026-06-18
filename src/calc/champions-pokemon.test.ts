import { describe, expect, it } from 'vitest'

import type { CalcParameters, ChampionsPokemon } from '../types/index.js'
import { toCalcPokemon } from './champions-pokemon.js'

// Test fixtures only need to satisfy the runtime shape — the strict
// species-keyed literal unions on ability / item / move aren't worth
// hand-rolling for fixture pokemon. `unknown` escape-hatch keeps the
// test focused on adapter behaviour.
const incineroar = {
  species: 'Incineroar',
  nature: 'Careful',
  ability: 'Intimidate',
  item: 'Safety Goggles',
  statPoints: { hp: 30, atk: 3, def: 12, spa: 0, spd: 17, spe: 4 },
  moves: ['Flare Blitz', 'Knock Off', 'Will-O-Wisp', 'Parting Shot'],
} as unknown as ChampionsPokemon

const baseParams: CalcParameters = {
  move: '',
  teraType: '',
  boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  status: '',
  isCrit: false,
  abilityOn: false,
  boostedStat: '',
}

describe('toCalcPokemon', () => {
  it('produces a level-50 @smogon/calc Pokemon for the given species', () => {
    const p = toCalcPokemon(incineroar, baseParams)
    expect(p.species.name).toBe('Incineroar')
    expect(p.level).toBe(50)
  })

  it('converts statPoints to EVs via the non-linear formula', () => {
    const p = toCalcPokemon(incineroar, baseParams)
    // 30 SP → 4 + 29*8 = 236
    expect(p.evs.hp).toBe(236)
    // 3 SP → 20, 12 SP → 92, 17 SP → 132, 4 SP → 28
    expect(p.evs.atk).toBe(20)
    expect(p.evs.def).toBe(92)
    expect(p.evs.spa).toBe(0)
    expect(p.evs.spd).toBe(132)
    expect(p.evs.spe).toBe(28)
  })

  it("defaults missing ivs to a perfect spread", () => {
    const p = toCalcPokemon(incineroar, baseParams)
    expect(p.ivs).toEqual({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 })
  })

  it("normalises empty-string sentinels to undefined", () => {
    const p = toCalcPokemon(incineroar, baseParams)
    expect(p.teraType).toBeUndefined()
    expect(p.status).toBe('')
  })

  it('honours params.teraType when set', () => {
    const p = toCalcPokemon(incineroar, { ...baseParams, teraType: 'Ghost' })
    expect(p.teraType).toBe('Ghost')
  })

  it("uses params.abilityOverride when set, else pokemon.ability", () => {
    const overridden = toCalcPokemon(incineroar, {
      ...baseParams,
      abilityOverride: 'Flash Fire',
    })
    expect(overridden.ability).toBe('Flash Fire')

    const baseline = toCalcPokemon(incineroar, baseParams)
    expect(baseline.ability).toBe('Intimidate')
  })

  it('translates the species display alias via toSmogonName', () => {
    const urshifu = {
      ...incineroar,
      species: 'Urshifu-Rapid',
      ability: 'Unseen Fist',
    }
    const p = toCalcPokemon(urshifu as unknown as ChampionsPokemon, baseParams)
    expect(p.species.name).toBe('Urshifu-Rapid-Strike')
  })

  it("applies boosts as-is", () => {
    const p = toCalcPokemon(incineroar, {
      ...baseParams,
      boosts: { atk: 2, def: -1, spa: 0, spd: 0, spe: 1 },
    })
    expect(p.boosts.atk).toBe(2)
    expect(p.boosts.def).toBe(-1)
    expect(p.boosts.spe).toBe(1)
  })
})
