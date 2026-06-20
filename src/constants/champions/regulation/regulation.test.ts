import { describe, expect, it } from 'vitest'

import { regulationSchema } from '~/schemas/champions/regulation'
import type { Regulation } from '~/types/champions/regulation'
import { currentRegulation, regulations, vgc2026_MA, vgc2026_MB } from './index'
import { m_b_additions } from './vgc-2026-m-b'

describe('vgc2026_MA regulation', () => {
  it('should satisfy the regulation schema', () => {
    expect(() => regulationSchema.parse(vgc2026_MA)).not.toThrow()
  })

  it('should have the expected id and name', () => {
    expect(vgc2026_MA.id).toBe('vgc2026_MA')
    expect(vgc2026_MA.name).toBe('VGC 2026 Regulation Set M-A')
  })

  it('should only legalise mega-evolution', () => {
    expect(vgc2026_MA.legalMechanics).toEqual(['mega-evolution'])
  })

  it('should have sorted, unique legal species and items', () => {
    const speciesSorted = [...vgc2026_MA.legalSpecies].toSorted()
    const itemsSorted = [...vgc2026_MA.legalItems].toSorted()
    expect([...vgc2026_MA.legalSpecies]).toEqual(speciesSorted)
    expect([...vgc2026_MA.legalItems]).toEqual(itemsSorted)
    expect(new Set(vgc2026_MA.legalSpecies).size).toBe(
      vgc2026_MA.legalSpecies.length,
    )
    expect(new Set(vgc2026_MA.legalItems).size).toBe(
      vgc2026_MA.legalItems.length,
    )
  })

  it('should preserve literal-union typing through destructuring', () => {
    const { legalSpecies, legalItems } = vgc2026_MA
    // Compile-time: these should narrow to the manual literal unions, not `string[]`.
    const _species: 'Incineroar' = legalSpecies.includes('Incineroar' as never)
      ? 'Incineroar'
      : 'Incineroar'
    const _item: 'Life Orb' = legalItems.includes('Life Orb' as never)
      ? 'Life Orb'
      : 'Life Orb'
    expect(_species).toBe('Incineroar')
    expect(_item).toBe('Life Orb')
  })
})

describe('vgc2026_MA speciesDefaults', () => {
  it('should curate a known signature spread (Talonflame)', () => {
    expect(vgc2026_MA.speciesDefaults.Talonflame).toEqual({
      nature: 'Jolly',
      move: 'Brave Bird',
      ability: 'Gale Wings',
    })
  })

  it('should omit ability for forced-ability Megas (Aerodactyl-Mega)', () => {
    // View through the widened Regulation type — the literal shape narrows
    // each entry to exactly the fields present, so reading `.ability` on a
    // Mega entry needs the partial-record view.
    const defaults: Regulation['speciesDefaults'] = vgc2026_MA.speciesDefaults
    const seed = defaults['Aerodactyl-Mega']
    expect(seed).toBeDefined()
    expect(seed?.ability).toBeUndefined()
  })

  it('should leave non-curated legal species undefined (partial record)', () => {
    // Abomasnow is legal in M-A but has no default loadout — confirms the
    // partial record passes regulationSchema without an Abomasnow entry.
    const defaults: Regulation['speciesDefaults'] = vgc2026_MA.speciesDefaults
    expect(defaults.Abomasnow).toBeUndefined()
    expect(() => regulationSchema.parse(vgc2026_MA)).not.toThrow()
  })

  it('should only reference legal species', () => {
    for (const key of Object.keys(vgc2026_MA.speciesDefaults)) {
      expect(vgc2026_MA.legalSpecies).toContain(key)
    }
  })

  it('should reject a defaults entry with an unknown nature', () => {
    const bad = {
      ...vgc2026_MA,
      speciesDefaults: { Talonflame: { nature: 'Hyper', move: 'Brave Bird' } },
    }
    expect(() => regulationSchema.parse(bad)).toThrow()
  })

  it('should reject a defaults entry with a non-existent move', () => {
    const bad = {
      ...vgc2026_MA,
      speciesDefaults: {
        Talonflame: { nature: 'Jolly', move: 'Nuclear Strike' },
      },
    }
    expect(() => regulationSchema.parse(bad)).toThrow()
  })
})

describe('vgc2026_MB regulation', () => {
  it('should satisfy the regulation schema', () => {
    expect(() => regulationSchema.parse(vgc2026_MB)).not.toThrow()
  })

  it('should have the expected id and name', () => {
    expect(vgc2026_MB.id).toBe('vgc2026_MB')
    expect(vgc2026_MB.name).toBe('VGC 2026 Regulation Set M-B')
  })

  it('should only legalise mega-evolution', () => {
    expect(vgc2026_MB.legalMechanics).toEqual(['mega-evolution'])
  })

  it('should have sorted, unique legal species and items', () => {
    const speciesSorted = [...vgc2026_MB.legalSpecies].toSorted()
    const itemsSorted = [...vgc2026_MB.legalItems].toSorted()
    expect([...vgc2026_MB.legalSpecies]).toEqual(speciesSorted)
    expect([...vgc2026_MB.legalItems]).toEqual(itemsSorted)
    expect(new Set(vgc2026_MB.legalSpecies).size).toBe(
      vgc2026_MB.legalSpecies.length,
    )
    expect(new Set(vgc2026_MB.legalItems).size).toBe(
      vgc2026_MB.legalItems.length,
    )
  })

  it('should have sorted m_b_additions (source-of-truth delta)', () => {
    expect([...m_b_additions.species]).toEqual(
      [...m_b_additions.species].toSorted(),
    )
    expect([...m_b_additions.items]).toEqual(
      [...m_b_additions.items].toSorted(),
    )
  })

  it('should not duplicate M-A entries in m_b_additions', () => {
    const maSpecies = new Set<string>(vgc2026_MA.legalSpecies)
    const maItems = new Set<string>(vgc2026_MA.legalItems)
    expect(m_b_additions.species.filter((s) => maSpecies.has(s))).toEqual([])
    expect(m_b_additions.items.filter((i) => maItems.has(i))).toEqual([])
  })

  it('should preserve literal-union typing through destructuring', () => {
    const { legalSpecies, legalItems } = vgc2026_MB
    const _species: 'Annihilape' = legalSpecies.includes('Annihilape' as never)
      ? 'Annihilape'
      : 'Annihilape'
    const _item: 'Raichunite X' = legalItems.includes('Raichunite X' as never)
      ? 'Raichunite X'
      : 'Raichunite X'
    expect(_species).toBe('Annihilape')
    expect(_item).toBe('Raichunite X')
  })

  it('should be a superset of vgc2026_MA legal species', () => {
    const mbSpecies = new Set<string>(vgc2026_MB.legalSpecies)
    for (const species of vgc2026_MA.legalSpecies) {
      expect(mbSpecies.has(species)).toBe(true)
    }
  })

  it('should be a superset of vgc2026_MA legal items', () => {
    const mbItems = new Set<string>(vgc2026_MB.legalItems)
    for (const item of vgc2026_MA.legalItems) {
      expect(mbItems.has(item)).toBe(true)
    }
  })

  // Regression guard: berry/item alias derivation walks legalItems, so any
  // non-Champions berry that sneaks in here would re-introduce dead shorthands
  // and re-open the Gold Berry → 'gold' / Gholdengo → 'Gold' collision class.
  // These specific berries are flagged isNonstandard:'Past' in
  // @pkmn/mods/champions and must stay out.
  it.each(['Gold Berry', 'Bluk Berry', 'Kee Berry', 'Kelpsy Berry'])(
    'should NOT include non-Champions berry %s in legalItems',
    (name) => {
      expect(vgc2026_MB.legalItems).not.toContain(name)
    },
  )
})

describe('vgc2026_MB speciesDefaults', () => {
  it('should curate a known signature spread (Annihilape)', () => {
    expect(vgc2026_MB.speciesDefaults.Annihilape).toEqual({
      nature: 'Adamant',
      move: 'Rage Fist',
      ability: 'Defiant',
    })
  })

  it('should curate a Champions-custom Mega default (Raichu-Mega-X)', () => {
    // Megas omit `ability` — the dex layer falls back to the forme's single
    // forced ability.
    expect(vgc2026_MB.speciesDefaults['Raichu-Mega-X']).toEqual({
      nature: 'Jolly',
      move: 'Volt Tackle',
    })
  })

  it('should only reference legal species', () => {
    for (const key of Object.keys(vgc2026_MB.speciesDefaults)) {
      expect(vgc2026_MB.legalSpecies).toContain(key)
    }
  })

  it('should reject a defaults entry with an unknown nature', () => {
    const bad = {
      ...vgc2026_MB,
      speciesDefaults: { Annihilape: { nature: 'Hyper', move: 'Rage Fist' } },
    }
    expect(() => regulationSchema.parse(bad)).toThrow()
  })
})

describe('regulations registry', () => {
  it('should expose vgc2026_MA via the registry', () => {
    expect(regulations.vgc2026_MA).toBe(vgc2026_MA)
  })

  it('should expose vgc2026_MB via the registry', () => {
    expect(regulations.vgc2026_MB).toBe(vgc2026_MB)
  })

  it('should point currentRegulation at vgc2026_MB', () => {
    expect(currentRegulation).toBe(vgc2026_MB)
  })

  it('should reject an unknown mechanic', () => {
    const bad = { ...vgc2026_MB, legalMechanics: ['z-power'] }
    expect(() => regulationSchema.parse(bad)).toThrow()
  })
})
