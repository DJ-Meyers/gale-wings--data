import { describe, expect, it } from 'vitest'

import {
  conditionalBasePower,
  relevantConditions,
} from './move-conditions.js'

describe('conditionalBasePower', () => {
  it('scales Last Respects by allies fainted (50 per ally)', () => {
    expect(conditionalBasePower('Last Respects', {})).toBe(50)
    expect(conditionalBasePower('Last Respects', { alliesFainted: 0 })).toBe(50)
    expect(conditionalBasePower('Last Respects', { alliesFainted: 1 })).toBe(100)
    expect(conditionalBasePower('Last Respects', { alliesFainted: 3 })).toBe(200)
  })

  it('caps Rage Fist at 350 (50 + 50 per hit)', () => {
    expect(conditionalBasePower('Rage Fist', {})).toBe(50)
    expect(conditionalBasePower('Rage Fist', { timesHit: 1 })).toBe(100)
    expect(conditionalBasePower('Rage Fist', { timesHit: 6 })).toBe(350)
    // above the slider max, still clamped — the formula must not exceed 350.
    expect(conditionalBasePower('Rage Fist', { timesHit: 7 })).toBe(350)
  })

  it('doubles a doubling move only when the ×2 condition is toggled', () => {
    // Off → undefined so the calc keeps the move's normal base power.
    expect(conditionalBasePower('Temper Flare', {})).toBeUndefined()
    expect(conditionalBasePower('Temper Flare', { doubled: true })).toBe(150)
    expect(conditionalBasePower('Stomping Tantrum', { doubled: true })).toBe(150)
    expect(conditionalBasePower('Avalanche', {})).toBeUndefined()
    expect(conditionalBasePower('Avalanche', { doubled: true })).toBe(120)
    expect(conditionalBasePower('Revenge', { doubled: true })).toBe(120)
    expect(conditionalBasePower('Assurance', { doubled: true })).toBe(120)
    expect(conditionalBasePower('Retaliate', { doubled: true })).toBe(140)
    expect(conditionalBasePower('Round', { doubled: true })).toBe(120)
  })

  it('doubles Lash Out via the toggle (the calc never does — dead countBoosts guard)', () => {
    expect(conditionalBasePower('Lash Out', {})).toBeUndefined()
    expect(conditionalBasePower('Lash Out', { doubled: true })).toBe(150)
  })

  it('returns undefined for ordinary moves (calc computes base power)', () => {
    expect(conditionalBasePower('Moonblast', {})).toBeUndefined()
    expect(conditionalBasePower('Moonblast', { doubled: true })).toBeUndefined()
    expect(conditionalBasePower('Heat Wave', { alliesFainted: 3 })).toBeUndefined()
  })

  it('lets an explicit basePowerOverride win over every move-specific formula', () => {
    // The headline `150BP` repro: forces a flat base power on any move, even one
    // with its own variable-power formula (Last Respects) or doubler.
    expect(conditionalBasePower('Last Respects', { basePowerOverride: 150 })).toBe(150)
    expect(
      conditionalBasePower('Last Respects', {
        basePowerOverride: 150,
        alliesFainted: 3,
      }),
    ).toBe(150)
    expect(
      conditionalBasePower('Temper Flare', {
        basePowerOverride: 150,
        doubled: true,
      }),
    ).toBe(150)
    // Applies to an ordinary move too (Earthquake 150BP).
    expect(conditionalBasePower('Earthquake', { basePowerOverride: 150 })).toBe(150)
  })
})

describe('relevantConditions', () => {
  it('maps each trigger to its control', () => {
    expect(relevantConditions('Last Respects').map((c) => c.id)).toEqual([
      'alliesFainted',
    ])
    expect(relevantConditions('Rage Fist').map((c) => c.id)).toEqual([
      'timesHit',
    ])
    // Every doubling move collapses onto the one generic ×2 toggle.
    expect(relevantConditions('Temper Flare').map((c) => c.id)).toEqual([
      'doubled',
    ])
    expect(relevantConditions('Avalanche').map((c) => c.id)).toEqual([
      'doubled',
    ])
    expect(relevantConditions('Assurance').map((c) => c.id)).toEqual(['doubled'])
  })

  it('labels the ×2 toggle with the move-specific trigger', () => {
    const [control] = relevantConditions('Assurance')
    expect(control.label).toBe('Target already took damage this turn (×2 power)')
  })

  it('reveals the allies-fainted control for Supreme Overlord regardless of move', () => {
    expect(
      relevantConditions('Tackle', 'Supreme Overlord').map((c) => c.id),
    ).toEqual(['alliesFainted'])
  })

  it('stacks the ×2 toggle and allies-fainted slider for a Supreme Overlord doubler', () => {
    expect(
      relevantConditions('Avalanche', 'Supreme Overlord').map((c) => c.id),
    ).toEqual(['doubled', 'alliesFainted'])
  })

  it('does not double up when Last Respects pairs with Supreme Overlord', () => {
    expect(
      relevantConditions('Last Respects', 'Supreme Overlord').map((c) => c.id),
    ).toEqual(['alliesFainted'])
  })

  it('is empty for an ordinary move with no relevant ability', () => {
    expect(relevantConditions('Moonblast')).toEqual([])
    expect(relevantConditions('Moonblast', 'Adaptability')).toEqual([])
  })

  it('exposes count bounds for slider controls', () => {
    const [allies] = relevantConditions('Last Respects')
    expect(allies).toMatchObject({ kind: 'count', min: 0, max: 3 })
    const [hits] = relevantConditions('Rage Fist')
    expect(hits).toMatchObject({ kind: 'count', min: 0, max: 6 })
  })

  it('offers a hit-count control bounded to the range the caller passes', () => {
    // The range is a @smogon/calc lookup the caller resolves, so the registry
    // only surfaces the control when given one.
    expect(relevantConditions('Icicle Spear').map((c) => c.id)).toEqual([])
    const [hits] = relevantConditions('Icicle Spear', undefined, {
      hitsRange: [2, 5],
    })
    expect(hits).toMatchObject({
      id: 'hits',
      kind: 'count',
      label: 'Number of hits',
      min: 2,
      max: 5,
    })
  })
})
