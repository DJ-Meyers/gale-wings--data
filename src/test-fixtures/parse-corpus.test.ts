import { describe, expect, it } from 'vitest'

import { fieldConditionsSchema } from '~/schemas/field-conditions'

import { PARSE_CORPUS } from './parse-corpus'

// Each fixture's `expected.fieldConditions` must round-trip through the data
// package's own schema. A fixture authored against a stale field-conditions
// shape fails here at the data layer, before the api parser ever sees it.
describe('PARSE_CORPUS fixtures', () => {
  it('every fixture has a unique id', () => {
    const seen = new Set<string>()
    for (const fixture of PARSE_CORPUS) {
      expect(seen.has(fixture.id), `duplicate fixture id: ${fixture.id}`).toBe(
        false,
      )
      seen.add(fixture.id)
    }
  })

  it.each(PARSE_CORPUS.map((f) => [f.id, f] as const))(
    '%s: expected.fieldConditions is schema-valid',
    (_id, fixture) => {
      expect(() =>
        fieldConditionsSchema.parse(fixture.expected.fieldConditions),
      ).not.toThrow()
    },
  )

  it.each(PARSE_CORPUS.map((f) => [f.id, f] as const))(
    '%s: per-side pokemon.fieldConditions is schema-valid when present',
    (_id, fixture) => {
      const sides = [fixture.expected.attacker, fixture.expected.defender]
      for (const side of sides) {
        if (side.pokemon.fieldConditions) {
          expect(() =>
            fieldConditionsSchema.parse(side.pokemon.fieldConditions),
          ).not.toThrow()
        }
      }
    },
  )
})
