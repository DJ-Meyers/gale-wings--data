import { describe, expect, it } from 'vitest'

import type { ParsedPokemon } from '../types/index.js'
import { parsedPokemonToCalcSide } from './parsed-to-calc-side.js'

describe('parsedPokemonToCalcSide', () => {
  it('returns null when species is missing', () => {
    expect(parsedPokemonToCalcSide({})).toBeNull()
    expect(
      parsedPokemonToCalcSide({ ability: 'Intimidate' } as ParsedPokemon),
    ).toBeNull()
  })

  it('returns null when ability is missing', () => {
    expect(
      parsedPokemonToCalcSide({
        species: 'Incineroar',
      } as ParsedPokemon),
    ).toBeNull()
  })

  it('produces a complete CalcSide for a minimal parse', () => {
    const side = parsedPokemonToCalcSide({
      species: 'Incineroar',
      ability: 'Intimidate',
    } as ParsedPokemon)

    expect(side).not.toBeNull()
    expect(side!.pokemon.species).toBe('Incineroar')
    expect(side!.pokemon.ability).toBe('Intimidate')
    expect(side!.pokemon.nature).toBe('Serious') // default
    expect(side!.pokemon.statPoints).toEqual({
      hp: 0,
      atk: 0,
      def: 0,
      spa: 0,
      spd: 0,
      spe: 0,
    })
    expect(side!.pokemon.moves).toEqual([])

    expect(side!.params.move).toBe('')
    expect(side!.params.teraType).toBe('')
    expect(side!.params.boosts).toEqual({
      atk: 0,
      def: 0,
      spa: 0,
      spd: 0,
      spe: 0,
    })
    expect(side!.params.status).toBe('')
    expect(side!.params.isCrit).toBe(false)
    expect(side!.params.abilityOn).toBe(false)
    expect(side!.params.boostedStat).toBe('')
  })

  it('passes parsed values through', () => {
    const side = parsedPokemonToCalcSide({
      species: 'Incineroar',
      nature: 'Adamant',
      ability: 'Intimidate',
      item: 'Life Orb',
      move: 'Knock Off',
      teraType: 'Ghost',
      status: 'brn',
      isCrit: true,
      abilityOn: true,
      boostedStat: 'atk',
      statPoints: { atk: 24, spe: 16 },
      boosts: { atk: 2 },
    } as ParsedPokemon)

    expect(side).not.toBeNull()
    expect(side!.pokemon.nature).toBe('Adamant')
    expect(side!.pokemon.item).toBe('Life Orb')
    expect(side!.pokemon.moves).toEqual(['Knock Off'])
    expect(side!.pokemon.statPoints).toMatchObject({ atk: 24, spe: 16, hp: 0 })
    expect(side!.params.move).toBe('Knock Off')
    expect(side!.params.teraType).toBe('Ghost')
    expect(side!.params.status).toBe('brn')
    expect(side!.params.isCrit).toBe(true)
    expect(side!.params.abilityOn).toBe(true)
    expect(side!.params.boostedStat).toBe('atk')
    expect(side!.params.boosts).toMatchObject({ atk: 2, def: 0 })
  })

  it('routes condition fields to side.conditions', () => {
    const side = parsedPokemonToCalcSide({
      species: 'Floette-Eternal',
      ability: 'Flower Veil',
      alliesFainted: 3,
      basePowerOverride: 150,
      hits: 5,
      hpPercent: 50,
      currentHp: 80,
      maxHp: 160,
    } as ParsedPokemon)

    expect(side).not.toBeNull()
    expect(side!.conditions).toEqual({
      alliesFainted: 3,
      basePowerOverride: 150,
      hits: 5,
      hpPercent: 50,
      currentHp: 80,
      maxHp: 160,
    })
  })

  it('produces a CalcSide that computeDamage accepts end-to-end', async () => {
    const { computeDamage } = await import('./compute-damage.js')
    const attacker = parsedPokemonToCalcSide({
      species: 'Floette-Eternal',
      ability: 'Flower Veil',
      nature: 'Modest',
      move: 'Moonblast',
      statPoints: { spa: 32, spe: 24, hp: 4 },
    } as ParsedPokemon)
    const defender = parsedPokemonToCalcSide({
      species: 'Incineroar',
      ability: 'Intimidate',
      nature: 'Careful',
      statPoints: { hp: 30, def: 12, spd: 17 },
    } as ParsedPokemon)
    expect(attacker).not.toBeNull()
    expect(defender).not.toBeNull()
    const r = computeDamage(attacker!, defender!, 'Moonblast', {})
    expect(r).not.toBeNull()
    expect(r!.range[0]).toBeGreaterThan(0)
  })
})
