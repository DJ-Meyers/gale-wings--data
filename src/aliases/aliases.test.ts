import { toID } from '@smogon/calc'
import { describe, expect, it } from 'vitest'

import { getSpecies } from '~/dex'
import {
  FIELD_CONDITION_ALIASES,
  fieldConditionAliases,
  ITEM_ALIASES,
  itemAliases,
  moveAliases,
  SPECIES_ALIASES,
  speciesAliases,
} from './index'

// A single alias ID resolving to two different canonical names is a silent
// bug: the Map keeps whichever entry was inserted last. Guard every alias map
// against collisions so adding a duplicate (e.g. reusing "BS") fails loudly.
describe('alias maps have no colliding ids', () => {
  it.each([
    ['move', moveAliases],
    ['item', itemAliases],
    ['species', speciesAliases],
    ['field-condition', fieldConditionAliases],
  ])('%s aliases are unique after normalization', (_label, aliases) => {
    const seen = new Map<string, string>()
    for (const [canonical, list] of Object.entries<readonly string[]>(aliases)) {
      for (const alias of list) {
        const id = toID(alias)
        const prior = seen.get(id)
        // A duplicate pointing at the same canonical is harmless; one pointing
        // at a different name is the silent-overwrite bug we guard against.
        expect(
          prior === undefined || prior === canonical,
          `alias "${alias}" (${id}) maps to both "${prior}" and "${canonical}"`,
        ).toBe(true)
        seen.set(id, canonical)
      }
    }
  })
})

describe('berry shorthands', () => {
  it('derives a bare shorthand for every "<Name> Berry" item', () => {
    expect(ITEM_ALIASES.get(toID('chople'))).toBe('Chople Berry')
    expect(ITEM_ALIASES.get(toID('occa'))).toBe('Occa Berry')
    expect(ITEM_ALIASES.get(toID('yache'))).toBe('Yache Berry')
  })

  // Regression guard: legacy/contest-only berries (Gold, Bluk, Kee, Kelpsy,
  // Pamtre, …) are flagged isNonstandard:'Past' in @pkmn/mods/champions and
  // are not in currentRegulation.legalItems. Their auto-derived shorthands
  // used to leak in via the full allItemNames snapshot, and one of them
  // (Gold Berry → 'gold') silently shadowed M-B's Gholdengo → 'Gold'. The
  // derivation now reads legalItems, so non-Champions berries get no alias.
  it.each(['gold', 'bluk', 'kee', 'kelpsy', 'pamtre'])(
    'does NOT derive a shorthand for non-Champions berry (%s)',
    (shorthand) => {
      expect(ITEM_ALIASES.get(toID(shorthand))).toBeUndefined()
    },
  )

  // Companion check on the source map: even if a future refactor changes
  // how ITEM_ALIASES is built, the raw itemAliases table must not list a
  // non-Champions berry as a canonical key. Catches accidental hand-edits.
  it.each(['Gold Berry', 'Bluk Berry', 'Kee Berry'])(
    'does NOT list non-Champions berry %s as a canonical key in itemAliases',
    (name) => {
      expect(name in itemAliases).toBe(false)
    },
  )
})

describe('Poison Barb alias', () => {
  // M-B introduced Barbaracle (species alias 'Barb'). Item aliases run before
  // species aliases in the parser, so the previous 'barb' shorthand for Poison
  // Barb shadowed Barbaracle silently. Renamed to 'PBarb' to keep both
  // shorthands discoverable.
  it('resolves Poison Barb via PBarb', () => {
    expect(ITEM_ALIASES.get(toID('PBarb'))).toBe('Poison Barb')
  })

  it('does NOT resolve Poison Barb via bare "barb" (reserved for Barbaracle)', () => {
    expect(ITEM_ALIASES.get(toID('barb'))).toBeUndefined()
  })
})

describe('M-C species aliases', () => {
  it.each([
    ['Rilla', 'Rillaboom'],
    ['Bax', 'Baxcalibur'],
    ['Mence', 'Salamence'],
    ['Sir', 'Sirfetch’d'],
    ['ZAbsol', 'Absol-Mega-Z'],
    ['LucZ', 'Lucario-Mega-Z'],
    ['indd-f', 'Indeedee-F'],
    ['Squawk', 'Squawkabilly'],
  ] as const)('resolves %s to %s', (alias, canonical) => {
    expect(SPECIES_ALIASES.get(toID(alias))).toBe(canonical)
  })

  // 'Goat' retargeted from Incineroar (easter-egg alias) to Gogoat in M-C.
  // buildAliasMap overwrites silently on duplicate ids, so the Incineroar row
  // must NOT keep 'GOAT' — these assertions fail loudly if it comes back.
  it('resolves goat to Gogoat (retargeted from Incineroar)', () => {
    expect(SPECIES_ALIASES.get(toID('goat'))).toBe('Gogoat')
    expect(speciesAliases.Incineroar).not.toContain('GOAT')
    expect(SPECIES_ALIASES.get(toID('incin'))).toBe('Incineroar')
  })

  // Pawmo and Pawmi are real species (Pawmot's pre-evolutions), so the CSV's
  // proposed aliases were dropped; only 'Paw' survives.
  it('resolves paw to Pawmot but leaves pawmo/pawmi unaliased', () => {
    expect(SPECIES_ALIASES.get(toID('paw'))).toBe('Pawmot')
    expect(SPECIES_ALIASES.get(toID('pawmo'))).toBeUndefined()
    expect(SPECIES_ALIASES.get(toID('pawmi'))).toBeUndefined()
  })
})

describe('Farfetch’d-line apostrophe forms', () => {
  // The canonical dex names use the typographic apostrophe (U+2019). Users
  // type the ASCII quote, and some pastes drop the apostrophe entirely —
  // toID collapses all three input forms to the same id, so every layer
  // keyed through toID resolves them identically.
  it.each([
    ["Farfetch'd"], // ASCII quote
    ['Farfetch’d'], // U+2019
    ['Farfetchd'], // no apostrophe
  ])('resolves %s to canonical Farfetch’d via the dex', (form) => {
    expect(getSpecies(form).name).toBe('Farfetch’d')
  })

  it.each([["Sirfetch'd"], ['Sirfetch’d'], ['Sirfetchd']])(
    'resolves %s to canonical Sirfetch’d via the dex',
    (form) => {
      expect(getSpecies(form).name).toBe('Sirfetch’d')
    },
  )
})

describe('M-C item aliases', () => {
  it.each([
    ['Helmet', 'Rocky Helmet'],
    ['Balloon', 'Air Balloon'],
    ['RCard', 'Red Card'],
    ['BBand', 'Binding Band'],
    ['Eject', 'Eject Button'],
    ['EButton', 'Eject Button'],
    ['NGem', 'Normal Gem'],
    ['Extender', 'Terrain Extender'],
    ['ESeed', 'Electric Seed'],
    ['PSeed', 'Psychic Seed'],
    ['MSeed', 'Misty Seed'],
    ['GSeed', 'Grassy Seed'],
  ] as const)('resolves %s to %s', (alias, canonical) => {
    expect(ITEM_ALIASES.get(toID(alias))).toBe(canonical)
  })

  it('does NOT alias bare "gem" (reserved for the move Power Gem)', () => {
    expect(ITEM_ALIASES.get(toID('gem'))).toBeUndefined()
  })
})

describe('field-condition aliases', () => {
  it('resolves Aurora Veil shorthands', () => {
    expect(FIELD_CONDITION_ALIASES.get(toID('Veil'))).toBe('Aurora Veil')
    expect(FIELD_CONDITION_ALIASES.get(toID('AVeil'))).toBe('Aurora Veil')
    expect(FIELD_CONDITION_ALIASES.get(toID('VEIL'))).toBe('Aurora Veil')
  })

  it('resolves Fairy Aura shorthands (FAura / F-Aura)', () => {
    // toID strips the hyphen, so 'FAura' and 'F-Aura' normalize to the same id.
    expect(FIELD_CONDITION_ALIASES.get(toID('FAura'))).toBe('Fairy Aura')
    expect(FIELD_CONDITION_ALIASES.get(toID('F-Aura'))).toBe('Fairy Aura')
    expect(FIELD_CONDITION_ALIASES.get(toID('faura'))).toBe('Fairy Aura')
  })

  it('resolves Dark Aura shorthands (DAura / D-Aura)', () => {
    expect(FIELD_CONDITION_ALIASES.get(toID('DAura'))).toBe('Dark Aura')
    expect(FIELD_CONDITION_ALIASES.get(toID('D-Aura'))).toBe('Dark Aura')
    expect(FIELD_CONDITION_ALIASES.get(toID('daura'))).toBe('Dark Aura')
  })

  it('resolves the remaining side-condition shorthands', () => {
    expect(FIELD_CONDITION_ALIASES.get(toID('Screen'))).toBe('Light Screen')
    expect(FIELD_CONDITION_ALIASES.get(toID('LS'))).toBe('Light Screen')
    expect(FIELD_CONDITION_ALIASES.get(toID('Ref'))).toBe('Reflect')
    expect(FIELD_CONDITION_ALIASES.get(toID('Refl'))).toBe('Reflect')
    expect(FIELD_CONDITION_ALIASES.get(toID('TW'))).toBe('Tailwind')
    expect(FIELD_CONDITION_ALIASES.get(toID('HH'))).toBe('Helping Hand')
    expect(FIELD_CONDITION_ALIASES.get(toID('FG'))).toBe('Friend Guard')
  })

  it('resolves terrain shorthands', () => {
    expect(FIELD_CONDITION_ALIASES.get(toID('PTerrain'))).toBe('Psychic Terrain')
    expect(FIELD_CONDITION_ALIASES.get(toID('PsychicT'))).toBe('Psychic Terrain')
    expect(FIELD_CONDITION_ALIASES.get(toID('PTerr'))).toBe('Psychic Terrain')
    expect(FIELD_CONDITION_ALIASES.get(toID('ETerrain'))).toBe(
      'Electric Terrain',
    )
    expect(FIELD_CONDITION_ALIASES.get(toID('ElectricT'))).toBe(
      'Electric Terrain',
    )
    expect(FIELD_CONDITION_ALIASES.get(toID('ETerr'))).toBe('Electric Terrain')
    expect(FIELD_CONDITION_ALIASES.get(toID('GTerrain'))).toBe('Grassy Terrain')
    expect(FIELD_CONDITION_ALIASES.get(toID('GrassyT'))).toBe('Grassy Terrain')
    expect(FIELD_CONDITION_ALIASES.get(toID('GTerr'))).toBe('Grassy Terrain')
    expect(FIELD_CONDITION_ALIASES.get(toID('MTerrain'))).toBe('Misty Terrain')
    expect(FIELD_CONDITION_ALIASES.get(toID('MistyT'))).toBe('Misty Terrain')
    expect(FIELD_CONDITION_ALIASES.get(toID('MTerr'))).toBe('Misty Terrain')
  })
})
