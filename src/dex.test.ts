import { toID } from '@smogon/calc'
import { describe, expect, it } from 'vitest'

import { SPECIES_ALIASES } from './aliases'
import { vgc2026_MA } from './constants/champions/regulation'
import { effectiveLearnset, getSpecies } from './dex'

describe('effectiveLearnset', () => {
  it('should return the base learnset for megas (own learnset is empty)', () => {
    const mega = getSpecies('charizardmegay')!
    const learnset = effectiveLearnset(mega)
    // Pulled from base Charizard.
    expect('flamethrower' in learnset).toBe(true)
    expect('airslash' in learnset).toBe(true)
  })

  it('should merge the forme signature move into the base learnset for Rotom forms', () => {
    // Rotom-Wash carries only Hydro Pump in its own learnset; without the
    // merge, the schema would reject any other move on Rotom-Wash even
    // though it inherits base Rotom's pool (Volt Switch, Thunderbolt, ...).
    const wash = getSpecies('rotomwash')!
    const learnset = effectiveLearnset(wash)
    expect('hydropump' in learnset).toBe(true)
    expect('voltswitch' in learnset).toBe(true)
    expect('thunderbolt' in learnset).toBe(true)
  })

  it('should return base Rotom unchanged (own learnset is canonical)', () => {
    const rotom = getSpecies('rotom')!
    const learnset = effectiveLearnset(rotom)
    expect('voltswitch' in learnset).toBe(true)
    // Base Rotom doesn't learn the form-locked signature moves.
    expect('hydropump' in learnset).toBe(false)
  })

  it('should NOT inherit base moves on regional variants (own learnset is standalone)', () => {
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

describe('championsMegaSpeciesPatch', () => {
  // Spot-check entries patched into the Species table — these don't exist
  // in @pkmn/dex or @pkmn/mods/champions's Pokedex, so without the patch
  // dex.species.get(...) returns an empty Species with no stats/types.
  it('should resolve Clefable-Mega with Fairy/Flying typing and Magic Bounce', () => {
    const mega = getSpecies('clefablemega')
    expect(mega.exists).toBe(true)
    expect(mega.types).toEqual(['Fairy', 'Flying'])
    expect(mega.abilities[0]).toBe('Magic Bounce')
    expect(mega.baseStats.spa).toBe(135)
    expect(mega.requiredItem).toBe('Clefablite')
  })

  it('should resolve Greninja-Mega with Water/Dark typing and Protean', () => {
    const mega = getSpecies('greninjamega')
    expect(mega.exists).toBe(true)
    expect(mega.types).toEqual(['Water', 'Dark'])
    expect(mega.abilities[0]).toBe('Protean')
    expect(mega.baseStats.spe).toBe(142)
  })

  it('should resolve Floette-Mega off Floette-Eternal (the actual stone holder)', () => {
    const mega = getSpecies('floettemega')
    expect(mega.exists).toBe(true)
    expect(mega.baseSpecies).toBe('Floette-Eternal')
    expect(mega.abilities[0]).toBe('Fairy Aura')
    expect(mega.requiredItem).toBe('Floettite')
  })
})

describe('Meowstic-Mega gender fallback', () => {
  // Upstream @pkmn/mods/champions aliases 'Meowstic-Mega' to the male form;
  // we override to the female form since the stats are identical and Floette/
  // Meowstic users typically default to F.
  it('should resolve bare Meowstic-Mega to the female form via dex.species.get', () => {
    const mega = getSpecies('Meowstic-Mega')
    expect(mega.name).toBe('Meowstic-F-Mega')
    expect(mega.baseSpecies).toBe('Meowstic-F')
  })

  it('should resolve bare Meowstic-Mega to the female form via SPECIES_ALIASES', () => {
    expect(SPECIES_ALIASES.get(toID('Meowstic-Mega'))).toBe('Meowstic-F-Mega')
  })
})

describe('patched megas legality', () => {
  // These megas only exist as legality entries in @pkmn/mods/champions's
  // FormatsData; the regulation snapshot must list them for the patch to be
  // reachable in-game.
  it.each([
    'Clefable-Mega',
    'Greninja-Mega',
    'Floette-Mega',
    'Meowstic-F-Mega',
    'Meowstic-M-Mega',
    'Glimmora-Mega',
  ])('should list %s in vgc2026_MA.legalSpecies', (name) => {
    expect(vgc2026_MA.legalSpecies).toContain(name)
  })
})
