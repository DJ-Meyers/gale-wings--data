import { describe, expect, it } from 'vitest'

import {
  championsAbilitiesSchema,
  championsItemsSchema,
  championsMovesSchema,
  championsSpeciesNameSchema,
} from './champions'

describe('championsItemsSchema', () => {
  it.each(['Sitrus Berry', 'Choice Scarf', 'Leftovers', 'Charizardite Y'])(
    'accepts Champions-legal item %s',
    (name) => {
      expect(championsItemsSchema.safeParse(name).success).toBe(true)
    },
  )

  it.each(['Assault Vest', 'Ability Shield', 'Not A Real Item'])(
    'rejects non-Champions item %s',
    (name) => {
      expect(championsItemsSchema.safeParse(name).success).toBe(false)
    },
  )
})

describe('championsMovesSchema', () => {
  it.each(['U-turn', 'Flare Blitz', 'Knock Off', 'Fake Out'])(
    'accepts Champions-legal move %s',
    (name) => {
      expect(championsMovesSchema.safeParse(name).success).toBe(true)
    },
  )

  it.each(['Happy Hour', 'Hidden Power', 'Splash', 'Tera Blast', 'Not A Real Move'])(
    'rejects non-Champions move %s',
    (name) => {
      expect(championsMovesSchema.safeParse(name).success).toBe(false)
    },
  )

  it.each(['Spore', 'Milk Drink', 'Soft-Boiled', 'Power Shift'])(
    'rejects move %s (no Champions-legal species learns it)',
    (name) => {
      expect(championsMovesSchema.safeParse(name).success).toBe(false)
    },
  )
})

describe('championsAbilitiesSchema', () => {
  it.each(['Intimidate', 'Blaze', 'Swift Swim', 'Levitate'])(
    'accepts ability %s (carried by at least one Champions-legal species)',
    (name) => {
      expect(championsAbilitiesSchema.safeParse(name).success).toBe(true)
    },
  )

  it.each(['Protosynthesis', 'Beads of Ruin', 'Quark Drive', 'Sword of Ruin'])(
    'rejects ability %s (every species carrying it is non-Champions)',
    (name) => {
      expect(championsAbilitiesSchema.safeParse(name).success).toBe(false)
    },
  )

  it('rejects a made-up ability', () => {
    expect(championsAbilitiesSchema.safeParse('Not A Real Ability').success).toBe(false)
  })
})

describe('championsSpeciesNameSchema', () => {
  it.each(['Incineroar', 'Charizard-Mega-X', 'Basculegion'])(
    'accepts Champions-legal species %s',
    (name) => {
      expect(championsSpeciesNameSchema.safeParse(name).success).toBe(true)
    },
  )

  it.each(['Mewtwo', 'Ogerpon', 'Flutter Mane', 'Not A Real Pokemon'])(
    'rejects non-Champions species %s',
    (name) => {
      expect(championsSpeciesNameSchema.safeParse(name).success).toBe(false)
    },
  )
})
