import { toID } from '@smogon/calc'
import { describe, expect, it } from 'vitest'

import {
  FIELD_CONDITION_ALIASES,
  fieldConditionAliases,
  ITEM_ALIASES,
  itemAliases,
  moveAliases,
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
  })
})
