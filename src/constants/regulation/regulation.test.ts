import { describe, expect, it } from 'vitest'

import { regulationSchema } from '../../schemas/regulation'
import { currentRegulation, regulations, vgc2026M_A } from './index'

describe('vgc2026M_A regulation', () => {
  it('satisfies the regulation schema', () => {
    expect(() => regulationSchema.parse(vgc2026M_A)).not.toThrow()
  })

  it('has the expected id', () => {
    expect(vgc2026M_A.id).toBe('Vgc2026M_A')
  })

  it('only legalises mega-evolution', () => {
    expect(vgc2026M_A.legalMechanics).toEqual(['mega-evolution'])
  })

  it('legal species and items are sorted and unique', () => {
    const speciesSorted = [...vgc2026M_A.legalSpecies].sort()
    const itemsSorted = [...vgc2026M_A.legalItems].sort()
    expect([...vgc2026M_A.legalSpecies]).toEqual(speciesSorted)
    expect([...vgc2026M_A.legalItems]).toEqual(itemsSorted)
    expect(new Set(vgc2026M_A.legalSpecies).size).toBe(vgc2026M_A.legalSpecies.length)
    expect(new Set(vgc2026M_A.legalItems).size).toBe(vgc2026M_A.legalItems.length)
  })

  it('preserves literal-union typing through destructuring', () => {
    const { legalSpecies, legalItems } = vgc2026M_A
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
  it('exposes Vgc2026M_A by id', () => {
    expect(regulations.Vgc2026M_A).toBe(vgc2026M_A)
  })

  it('currentRegulation points at Vgc2026M_A', () => {
    expect(currentRegulation).toBe(vgc2026M_A)
  })

  it('rejects an unknown mechanic', () => {
    const bad = { ...vgc2026M_A, legalMechanics: ['z-power'] }
    expect(() => regulationSchema.parse(bad)).toThrow()
  })
})
