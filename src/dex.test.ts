import { describe, expect, it } from 'vitest'

import { effectiveLearnset, getSpecies } from './dex'

describe('effectiveLearnset', () => {
  it('returns the base learnset for megas (own learnset is empty)', () => {
    const mega = getSpecies('charizardmegay')!
    const learnset = effectiveLearnset(mega)
    // Pulled from base Charizard.
    expect('flamethrower' in learnset).toBe(true)
    expect('airslash' in learnset).toBe(true)
  })

  it('merges the forme signature move into the base learnset for Rotom forms', () => {
    // Rotom-Wash carries only Hydro Pump in its own learnset; without the
    // merge, the schema would reject any other move on Rotom-Wash even
    // though it inherits base Rotom's pool (Volt Switch, Thunderbolt, ...).
    const wash = getSpecies('rotomwash')!
    const learnset = effectiveLearnset(wash)
    expect('hydropump' in learnset).toBe(true)
    expect('voltswitch' in learnset).toBe(true)
    expect('thunderbolt' in learnset).toBe(true)
  })

  it('returns base Rotom unchanged (own learnset is canonical)', () => {
    const rotom = getSpecies('rotom')!
    const learnset = effectiveLearnset(rotom)
    expect('voltswitch' in learnset).toBe(true)
    // Base Rotom doesn't learn the form-locked signature moves.
    expect('hydropump' in learnset).toBe(false)
  })

  it('does NOT inherit base moves on regional variants (own learnset is standalone)', () => {
    // Alolan Ninetales is Ice/Fairy and has its own complete learnset (64+
    // moves); it must not pick up base Ninetales's Fire-type pool. If the
    // forme-merge logic tripped here, Flamethrower would become legal on
    // Alolan Ninetales — which is wrong.
    const alolan = getSpecies('ninetalesalola')!
    const learnset = effectiveLearnset(alolan)
    expect('aurorabeam' in learnset || 'icebeam' in learnset).toBe(true)
    expect('flamethrower' in learnset).toBe(false)
  })
})
