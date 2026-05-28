import { describe, expect, it } from 'vitest'

import { championsPokemonSchema, looseChampionsPokemonSchema } from './pokemon'

const baseIncineroar = {
  species: 'Incineroar',
  nature: 'Jolly',
  ability: 'Intimidate',
  item: 'Choice Scarf',
  statPoints: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
  moves: ['Flare Blitz', 'Fake Out', 'Hyper Beam', 'Parting Shot'],
}

describe('championsPokemonSchema(Incineroar)', () => {
  it('should accept a fully valid Incineroar', () => {
    const result =
      championsPokemonSchema('Incineroar').safeParse(baseIncineroar)
    expect(result.success).toBe(true)
  })

  it.each(['Flare Blitz', 'Fake Out', 'Hyper Beam'])(
    'should accept %s in moves (Incineroar can learn it)',
    (move) => {
      const result = championsPokemonSchema('Incineroar').safeParse({
        ...baseIncineroar,
        moves: [move],
      })
      expect(result.success).toBe(true)
    },
  )

  it.each(['U-turn', 'Knock Off'])(
    'should reject %s in moves (removed from Incineroar in Champions)',
    (move) => {
      const result = championsPokemonSchema('Incineroar').safeParse({
        ...baseIncineroar,
        moves: [move],
      })
      expect(result.success).toBe(false)
    },
  )

  it('should reject an ability that exists in Champions but not on Incineroar', () => {
    // Swift Swim is a real Champions ability (Basculegion has it),
    // but Incineroar gets Blaze/Intimidate only.
    const result = championsPokemonSchema('Incineroar').safeParse({
      ...baseIncineroar,
      ability: 'Swift Swim',
    })
    expect(result.success).toBe(false)
  })

  it('should reject a species mismatch in the parsed object', () => {
    const result = championsPokemonSchema('Incineroar').safeParse({
      ...baseIncineroar,
      species: 'Basculegion',
    })
    expect(result.success).toBe(false)
  })

  it('should reject duplicate moves', () => {
    const result = championsPokemonSchema('Incineroar').safeParse({
      ...baseIncineroar,
      moves: ['Flare Blitz', 'Flare Blitz'],
    })
    expect(result.success).toBe(false)
  })

  it('should accept an empty moves array', () => {
    const result = championsPokemonSchema('Incineroar').safeParse({
      ...baseIncineroar,
      moves: [],
    })
    expect(result.success).toBe(true)
  })
})

describe('looseChampionsPokemonSchema', () => {
  it('should accept Incineroar with an ability it does NOT actually have', () => {
    // The point of "loose": validates each field is from the Champions pool,
    // but does NOT enforce per-species relationships.
    // Swift Swim is a legal Champions ability (Basculegion has it) but not on Incineroar.
    const result = looseChampionsPokemonSchema.safeParse({
      ...baseIncineroar,
      ability: 'Swift Swim',
    })
    expect(result.success).toBe(true)
  })

  it('should reject a non-Champions species', () => {
    const result = looseChampionsPokemonSchema.safeParse({
      ...baseIncineroar,
      species: 'Mewtwo',
    })
    expect(result.success).toBe(false)
  })

  it('should reject a non-Champions item', () => {
    const result = looseChampionsPokemonSchema.safeParse({
      ...baseIncineroar,
      item: 'Assault Vest',
    })
    expect(result.success).toBe(false)
  })

  it('should reject a non-Champions move (even if no species enforced)', () => {
    const result = looseChampionsPokemonSchema.safeParse({
      ...baseIncineroar,
      moves: ['Happy Hour'],
    })
    expect(result.success).toBe(false)
  })
})
