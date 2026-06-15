import { toID } from '@smogon/calc'
import { describe, expect, it } from 'vitest'

import {
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
