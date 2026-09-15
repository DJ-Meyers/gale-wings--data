import { describe, expect, it } from 'vitest'

import { getSpecies } from '~/dex'
import {
  championsAbilitiesSchema,
  championsItemsSchema,
  championsMovesSchema,
  championsSpeciesMovesSchema,
  championsSpeciesNameSchema,
} from './index'

describe('championsItemsSchema', () => {
  it.each(['Sitrus Berry', 'Choice Scarf', 'Leftovers', 'Charizardite Y'])(
    'should accept Champions-legal item %s',
    (name) => {
      expect(championsItemsSchema.safeParse(name).success).toBe(true)
    },
  )

  it.each(['Assault Vest', 'Ability Shield', 'Not A Real Item'])(
    'should reject non-Champions item %s',
    (name) => {
      expect(championsItemsSchema.safeParse(name).success).toBe(false)
    },
  )
})

describe('championsMovesSchema', () => {
  it.each(['U-turn', 'Flare Blitz', 'Knock Off', 'Fake Out'])(
    'should accept Champions-legal move %s',
    (name) => {
      expect(championsMovesSchema.safeParse(name).success).toBe(true)
    },
  )

  // M-C signature moves: flagged isNonstandard pre-M-C, un-flagged in the
  // vendored Showdown tables once their learners became legal.
  it.each(['Pyro Ball', 'Glaive Rush'])(
    'should accept M-C signature move %s',
    (name) => {
      expect(championsMovesSchema.safeParse(name).success).toBe(true)
    },
  )

  it.each([
    'Happy Hour',
    'Hidden Power',
    'Splash',
    'Tera Blast',
    'Not A Real Move',
  ])('should reject non-Champions move %s', (name) => {
    expect(championsMovesSchema.safeParse(name).success).toBe(false)
  })

  // Milk Drink left this cohort in M-C: Gogoat (legal since M-C) carries it
  // as ["9M"] in the vendored learnsets.
  it.each(['Spore', 'Soft-Boiled', 'Power Shift'])(
    'should reject move %s (no Champions-legal species learns it)',
    (name) => {
      expect(championsMovesSchema.safeParse(name).success).toBe(false)
    },
  )

  it('should accept Milk Drink (Gogoat is M-C-legal and learns it)', () => {
    expect(championsMovesSchema.safeParse('Milk Drink').success).toBe(true)
  })
})

describe('championsAbilitiesSchema', () => {
  it.each(['Intimidate', 'Blaze', 'Swift Swim', 'Levitate'])(
    'should accept ability %s (carried by at least one Champions-legal species)',
    (name) => {
      expect(championsAbilitiesSchema.safeParse(name).success).toBe(true)
    },
  )

  it.each(['Protosynthesis', 'Beads of Ruin', 'Quark Drive', 'Sword of Ruin'])(
    'should reject ability %s (every species carrying it is non-Champions)',
    (name) => {
      expect(championsAbilitiesSchema.safeParse(name).success).toBe(false)
    },
  )

  it('should reject a made-up ability', () => {
    expect(
      championsAbilitiesSchema.safeParse('Not A Real Ability').success,
    ).toBe(false)
  })
})

describe('championsSpeciesNameSchema', () => {
  it.each(['Incineroar', 'Charizard-Mega-X', 'Basculegion'])(
    'should accept Champions-legal species %s',
    (name) => {
      expect(championsSpeciesNameSchema.safeParse(name).success).toBe(true)
    },
  )

  it.each(['Mewtwo', 'Ogerpon', 'Flutter Mane', 'Not A Real Pokemon'])(
    'should reject non-Champions species %s',
    (name) => {
      expect(championsSpeciesNameSchema.safeParse(name).success).toBe(false)
    },
  )
})

describe('championsSpeciesMovesSchema (M-C grants)', () => {
  // User-confirmed M-C learnset grants, present as ["9M"] in the vendored
  // Showdown learnsets — regression-tested here, where the species become
  // legal.
  it('should accept Moonblast on a Wigglytuff spread', () => {
    const schema = championsSpeciesMovesSchema(getSpecies('Wigglytuff'))
    expect(schema.safeParse('Moonblast').success).toBe(true)
  })

  it('should accept Storm Throw on a Grapploct spread', () => {
    const schema = championsSpeciesMovesSchema(getSpecies('Grapploct'))
    expect(schema.safeParse('Storm Throw').success).toBe(true)
  })

  it('should accept the signature move on its M-C learner', () => {
    expect(
      championsSpeciesMovesSchema(getSpecies('Cinderace')).safeParse(
        'Pyro Ball',
      ).success,
    ).toBe(true)
    expect(
      championsSpeciesMovesSchema(getSpecies('Baxcalibur')).safeParse(
        'Glaive Rush',
      ).success,
    ).toBe(true)
  })

  it('should still reject Hidden Power / Tera Blast on an M-C species', () => {
    const schema = championsSpeciesMovesSchema(getSpecies('Cinderace'))
    expect(schema.safeParse('Hidden Power').success).toBe(false)
    expect(schema.safeParse('Tera Blast').success).toBe(false)
  })
})
