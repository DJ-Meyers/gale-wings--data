import { describe, expect, it } from 'vitest'

import { regulationSchema } from '~/schemas/champions/regulation'
import type { Regulation } from '~/types/champions/regulation'
import { currentRegulation, regulations, vgc2026_MA } from './index'

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

describe('regulations registry', () => {
  it('should expose vgc2026_MA via the registry', () => {
    expect(regulations.vgc2026_MA).toBe(vgc2026_MA)
  })

  it('should point currentRegulation at vgc2026_MA', () => {
    expect(currentRegulation).toBe(vgc2026_MA)
  })

  it('should reject an unknown mechanic', () => {
    const bad = { ...vgc2026_MA, legalMechanics: ['z-power'] }
    expect(() => regulationSchema.parse(bad)).toThrow()
  })
})
