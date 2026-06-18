import { Pokemon } from '@smogon/calc'
import { describe, expect, it } from 'vitest'

import type {
  CalcParameters,
  ChampionsPokemon,
  FieldConditions,
} from '../types/index.js'
import {
  computeCurHp,
  computeDamage,
  shouldActivateAbility,
} from './compute-damage.js'
import { gen } from './gen.js'

const baseParams: CalcParameters = {
  move: '',
  teraType: '',
  boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  status: '',
  isCrit: false,
  abilityOn: false,
  boostedStat: '',
}

const emptyField: FieldConditions = {}

const floette: ChampionsPokemon = {
  species: 'Floette-Eternal',
  nature: 'Modest',
  ability: 'Flower Veil',
  item: 'Leftovers',
  statPoints: { hp: 4, atk: 0, def: 0, spa: 32, spd: 0, spe: 24 },
  moves: [],
}

const incineroar: ChampionsPokemon = {
  species: 'Incineroar',
  nature: 'Careful',
  ability: 'Intimidate',
  item: 'Leftovers',
  statPoints: { hp: 30, atk: 3, def: 12, spa: 0, spd: 17, spe: 4 },
  moves: [],
}

describe('computeDamage', () => {
  it('produces a non-null result for a valid attacker/defender/move', () => {
    const r = computeDamage(
      { pokemon: floette, params: baseParams },
      { pokemon: incineroar, params: baseParams },
      'Moonblast',
      emptyField,
    )
    expect(r).not.toBeNull()
    expect(r!.range[0]).toBeGreaterThan(0)
    expect(r!.range[1]).toBeGreaterThanOrEqual(r!.range[0])
    expect(r!.defenderMaxHp).toBeGreaterThan(0)
    expect(typeof r!.desc).toBe('string')
  })

  it('returns null for an unknown species', () => {
    // species is intentionally invalid; the schema literal union won't
    // accept it, so cast through unknown to bypass the type narrowing.
    const fake = {
      ...incineroar,
      species: 'Pikachuuuu',
    } as unknown as ChampionsPokemon
    const r = computeDamage(
      { pokemon: fake, params: baseParams },
      { pokemon: incineroar, params: baseParams },
      'Moonblast',
      emptyField,
    )
    expect(r).toBeNull()
  })

  it('returns null for an unknown move', () => {
    const r = computeDamage(
      { pokemon: floette, params: baseParams },
      { pokemon: incineroar, params: baseParams },
      'Notamoveatall',
      emptyField,
    )
    expect(r).toBeNull()
  })

  it('routes attacker isCrit into Move construction — crit deals ≥ non-crit', () => {
    const noCrit = computeDamage(
      { pokemon: floette, params: baseParams },
      { pokemon: incineroar, params: baseParams },
      'Moonblast',
      emptyField,
    )
    const crit = computeDamage(
      { pokemon: floette, params: { ...baseParams, isCrit: true } },
      { pokemon: incineroar, params: baseParams },
      'Moonblast',
      emptyField,
    )
    expect(crit).not.toBeNull()
    expect(noCrit).not.toBeNull()
    expect(crit!.range[1]).toBeGreaterThan(noCrit!.range[1])
  })

  it('hardcodes gameType: Doubles — same calc still works under doubles spread reduction', () => {
    const r = computeDamage(
      { pokemon: floette, params: baseParams },
      { pokemon: incineroar, params: baseParams },
      'Dazzling Gleam',
      emptyField,
    )
    expect(r).not.toBeNull()
    expect(r!.range[0]).toBeGreaterThan(0)
  })

  it('isSingleTarget removes the spread modifier on a spread move', () => {
    const spread = computeDamage(
      { pokemon: floette, params: baseParams },
      { pokemon: incineroar, params: baseParams },
      'Dazzling Gleam',
      emptyField,
    )
    const single = computeDamage(
      { pokemon: floette, params: baseParams },
      { pokemon: incineroar, params: baseParams },
      'Dazzling Gleam',
      emptyField,
      { isSingleTarget: true },
    )
    expect(spread).not.toBeNull()
    expect(single).not.toBeNull()
    // Spread modifier is 0.75× in doubles, so removing it should bump damage.
    expect(single!.range[1]).toBeGreaterThan(spread!.range[1])
  })

  it('scales Last Respects damage with conditions.alliesFainted', () => {
    const none = computeDamage(
      { pokemon: floette, params: baseParams, conditions: { alliesFainted: 0 } },
      { pokemon: incineroar, params: baseParams },
      'Last Respects',
      emptyField,
    )
    const three = computeDamage(
      { pokemon: floette, params: baseParams, conditions: { alliesFainted: 3 } },
      { pokemon: incineroar, params: baseParams },
      'Last Respects',
      emptyField,
    )
    expect(none).not.toBeNull()
    expect(three).not.toBeNull()
    // 50 BP → 200 BP is a 4× base-power jump, so damage rises sharply.
    expect(three!.range[1]).toBeGreaterThan(none!.range[1] * 3)
  })

  it('doubles Temper Flare damage when the previous move failed', () => {
    const normal = computeDamage(
      { pokemon: floette, params: baseParams },
      { pokemon: incineroar, params: baseParams },
      'Temper Flare',
      emptyField,
    )
    const doubled = computeDamage(
      { pokemon: floette, params: baseParams, conditions: { doubled: true } },
      { pokemon: incineroar, params: baseParams },
      'Temper Flare',
      emptyField,
    )
    expect(normal).not.toBeNull()
    expect(doubled).not.toBeNull()
    expect(doubled!.range[1]).toBeGreaterThan(normal!.range[1])
  })

  it('routes alliesFainted into Supreme Overlord — more fallen allies hit harder', () => {
    // Supreme Overlord boosts every move ~10% per fallen ally; the app feeds
    // it through the native Pokemon.alliesFainted path (not overrides).
    const overlord = {
      ...incineroar,
      species: 'Kingambit',
      ability: 'Supreme Overlord',
    } as unknown as ChampionsPokemon
    const noAllies = computeDamage(
      { pokemon: overlord, params: baseParams, conditions: { alliesFainted: 0 } },
      { pokemon: incineroar, params: baseParams },
      'Iron Head',
      emptyField,
    )
    const threeAllies = computeDamage(
      { pokemon: overlord, params: baseParams, conditions: { alliesFainted: 3 } },
      { pokemon: incineroar, params: baseParams },
      'Iron Head',
      emptyField,
    )
    expect(noAllies).not.toBeNull()
    expect(threeAllies).not.toBeNull()
    expect(threeAllies!.range[1]).toBeGreaterThan(noAllies!.range[1])
  })

  it('isSingleTarget is a no-op for non-spread moves', () => {
    const normal = computeDamage(
      { pokemon: floette, params: baseParams },
      { pokemon: incineroar, params: baseParams },
      'Moonblast',
      emptyField,
    )
    const flagged = computeDamage(
      { pokemon: floette, params: baseParams },
      { pokemon: incineroar, params: baseParams },
      'Moonblast',
      emptyField,
      { isSingleTarget: true },
    )
    expect(normal).not.toBeNull()
    expect(flagged).not.toBeNull()
    expect(flagged!.range).toEqual(normal!.range)
  })

  it('applies conditions.basePowerOverride to a named move (the 150BP repro)', () => {
    // Last Respects sits at a native 50 BP; the override forces 150.
    const native = computeDamage(
      { pokemon: floette, params: baseParams },
      { pokemon: incineroar, params: baseParams },
      'Last Respects',
      emptyField,
    )
    const overridden = computeDamage(
      {
        pokemon: floette,
        params: baseParams,
        conditions: { basePowerOverride: 150 },
      },
      { pokemon: incineroar, params: baseParams },
      'Last Respects',
      emptyField,
    )
    expect(native).not.toBeNull()
    expect(overridden).not.toBeNull()
    // 50 → 150 BP triples the base power, so damage rises well above the native.
    expect(overridden!.range[1]).toBeGreaterThan(native!.range[1] * 2)
  })

  it('conditions.basePowerOverride beats the move-specific formula', () => {
    // alliesFainted would push Last Respects to 200 BP, but the explicit
    // override wins, so this matches the plain 150BP result rather than 200.
    const overrideOnly = computeDamage(
      {
        pokemon: floette,
        params: baseParams,
        conditions: { basePowerOverride: 150 },
      },
      { pokemon: incineroar, params: baseParams },
      'Last Respects',
      emptyField,
    )
    const overrideWithAllies = computeDamage(
      {
        pokemon: floette,
        params: baseParams,
        conditions: { basePowerOverride: 150, alliesFainted: 3 },
      },
      { pokemon: incineroar, params: baseParams },
      'Last Respects',
      emptyField,
    )
    expect(overrideOnly).not.toBeNull()
    expect(overrideWithAllies).not.toBeNull()
    expect(overrideWithAllies!.range).toEqual(overrideOnly!.range)
  })

  it('routes conditions.hits into Move — more hits deal more damage', () => {
    // Icicle Spear hits 2–5 times; pinning more hits raises total damage.
    const twoHits = computeDamage(
      { pokemon: floette, params: baseParams, conditions: { hits: 2 } },
      { pokemon: incineroar, params: baseParams },
      'Icicle Spear',
      emptyField,
    )
    const fiveHits = computeDamage(
      { pokemon: floette, params: baseParams, conditions: { hits: 5 } },
      { pokemon: incineroar, params: baseParams },
      'Icicle Spear',
      emptyField,
    )
    expect(twoHits).not.toBeNull()
    expect(fiveHits).not.toBeNull()
    expect(fiveHits!.range[1]).toBeGreaterThan(twoHits!.range[1])
  })

  // Defender HP affects KO chance, not the damage range itself.
  // `100/177` parsed = `currentHp: 100`. Verify the calc sees it.
  it('routes parsed currentHp into the defender Pokemon for KO math', () => {
    const fullHp = computeDamage(
      { pokemon: floette, params: { ...baseParams, move: 'Moonblast' } },
      { pokemon: incineroar, params: baseParams },
      'Moonblast',
      emptyField,
    )
    const lowHp = computeDamage(
      { pokemon: floette, params: { ...baseParams, move: 'Moonblast' } },
      {
        pokemon: incineroar,
        params: baseParams,
        conditions: { currentHp: 1 },
      },
      'Moonblast',
      emptyField,
    )
    expect(fullHp).not.toBeNull()
    expect(lowHp).not.toBeNull()
    // Same damage range either way (calc roll doesn't depend on cur HP).
    expect(lowHp!.range).toEqual(fullHp!.range)
    // KO chance shifts: full HP is unlikely to be OHKO; 1 HP is guaranteed.
    expect(lowHp!.koChance).not.toBe(fullHp!.koChance)
  })
})

describe('computeCurHp', () => {
  // Build a Pokemon to read maxHP from; the spread doesn't matter much for
  // the formula tests, just that maxHP is a known value to project against.
  const mk = () =>
    new Pokemon(gen, 'Incineroar', {
      level: 50,
      nature: 'Careful',
      evs: { hp: 120, atk: 12, def: 48, spd: 68, spe: 16 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    })

  it('returns undefined when no HP state is set', () => {
    expect(computeCurHp(mk(), undefined)).toBeUndefined()
    expect(computeCurHp(mk(), {})).toBeUndefined()
  })

  it('passes currentHp through verbatim when set', () => {
    expect(computeCurHp(mk(), { currentHp: 50 })).toBe(50)
  })

  it('clamps currentHp to the constructed maxHP', () => {
    const p = mk()
    expect(computeCurHp(p, { currentHp: p.maxHP() + 100 })).toBe(p.maxHP())
  })

  it('clamps currentHp to 0 when negative', () => {
    expect(computeCurHp(mk(), { currentHp: -5 })).toBe(0)
  })

  it('computes from hpPercent + the constructed maxHP when currentHp absent', () => {
    const p = mk()
    expect(computeCurHp(p, { hpPercent: 50 })).toBe(Math.round(p.maxHP() / 2))
    expect(computeCurHp(p, { hpPercent: 100 })).toBe(p.maxHP())
    expect(computeCurHp(p, { hpPercent: 0 })).toBe(0)
  })

  it('prefers currentHp over hpPercent when both are set', () => {
    // Fraction form populates both currentHp and hpPercent; currentHp wins.
    expect(computeCurHp(mk(), { currentHp: 33, hpPercent: 50 })).toBe(33)
  })
})

describe('shouldActivateAbility', () => {
  it('returns true when params.abilityOn is true', () => {
    expect(
      shouldActivateAbility(
        incineroar,
        { ...baseParams, abilityOn: true },
        emptyField,
      ),
    ).toBe(true)
  })

  it('activates Protosynthesis in Sun', () => {
    // Flutter Mane is the canonical Protosynthesis user but isn't in the
    // current Champions regulation's species literal — cast through
    // unknown so the type narrowing doesn't reject it.
    const flutterMane = {
      species: 'Flutter Mane',
      nature: 'Timid',
      ability: 'Protosynthesis',
      item: 'Leftovers',
      statPoints: { hp: 4, atk: 0, def: 0, spa: 32, spd: 0, spe: 24 },
      moves: [],
    } as unknown as ChampionsPokemon
    expect(
      shouldActivateAbility(flutterMane, baseParams, { weather: 'Sun' }),
    ).toBe(true)
  })

  it('does NOT activate Protosynthesis outside Sun (Booster Energy disabled — see compute-damage.ts note)', () => {
    const flutterMane = {
      species: 'Flutter Mane',
      nature: 'Timid',
      ability: 'Protosynthesis',
      item: 'Leftovers',
      statPoints: { hp: 4, atk: 0, def: 0, spa: 32, spd: 0, spe: 24 },
      moves: [],
    } as unknown as ChampionsPokemon
    expect(shouldActivateAbility(flutterMane, baseParams, emptyField)).toBe(
      false,
    )
  })

  it('activates Quark Drive on Electric terrain', () => {
    // Iron Hands is the canonical Quark Drive user but isn't in the
    // current Champions regulation's species literal — cast through
    // unknown so the type narrowing doesn't reject it.
    const ironHands = {
      species: 'Iron Hands',
      nature: 'Adamant',
      ability: 'Quark Drive',
      item: 'Leftovers',
      statPoints: { hp: 16, atk: 32, def: 4, spa: 0, spd: 8, spe: 0 },
      moves: [],
    } as unknown as ChampionsPokemon
    expect(
      shouldActivateAbility(ironHands, baseParams, { terrain: 'Electric' }),
    ).toBe(true)
  })

  it('respects abilityOverride for Paradox detection (Skill Swap / Trace)', () => {
    expect(
      shouldActivateAbility(
        incineroar,
        { ...baseParams, abilityOverride: 'Protosynthesis' },
        { weather: 'Sun' },
      ),
    ).toBe(true)
  })
})
