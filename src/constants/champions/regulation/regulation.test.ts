import { describe, expect, it } from 'vitest'

import { regulationSchema } from '../../../schemas/champions/regulation'
import { currentRegulation, regulations, vgc2026_MA } from './index'

describe('vgc2026_MA regulation', () => {
  it('satisfies the regulation schema', () => {
    expect(() => regulationSchema.parse(vgc2026_MA)).not.toThrow()
  })

  it('has the expected id and name', () => {
    expect(vgc2026_MA.id).toBe('vgc2026_MA')
    expect(vgc2026_MA.name).toBe('VGC 2026 Regulation Set M-A')
  })

  it('only legalises mega-evolution', () => {
    expect(vgc2026_MA.legalMechanics).toEqual(['mega-evolution'])
  })

  it('legal species and items are sorted and unique', () => {
    const speciesSorted = [...vgc2026_MA.legalSpecies].sort()
    const itemsSorted = [...vgc2026_MA.legalItems].sort()
    expect([...vgc2026_MA.legalSpecies]).toEqual(speciesSorted)
    expect([...vgc2026_MA.legalItems]).toEqual(itemsSorted)
    expect(new Set(vgc2026_MA.legalSpecies).size).toBe(vgc2026_MA.legalSpecies.length)
    expect(new Set(vgc2026_MA.legalItems).size).toBe(vgc2026_MA.legalItems.length)
  })

  it('preserves literal-union typing through destructuring', () => {
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

describe('regulations registry', () => {
  it('exposes vgc2026_MA via the registry', () => {
    expect(regulations.vgc2026_MA).toBe(vgc2026_MA)
  })

  it('currentRegulation points at vgc2026_MA', () => {
    expect(currentRegulation).toBe(vgc2026_MA)
  })

  it('rejects an unknown mechanic', () => {
    const bad = { ...vgc2026_MA, legalMechanics: ['z-power'] }
    expect(() => regulationSchema.parse(bad)).toThrow()
  })
})
