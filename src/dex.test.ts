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

  it('should walk Floette-Mega via battleOnly (Floette-Eternal), not baseSpecies (Floette)', () => {
    // Upstream @pkmn/mods/champions sets Floette-Mega.baseSpecies = 'Floette'
    // but battleOnly = 'Floette-Eternal'. The Eternal form is the real
    // mega-stone holder and owns Light of Ruin; regular Floette doesn't.
    const mega = getSpecies('floettemega')
    const learnset = effectiveLearnset(mega)
    expect('lightofruin' in learnset).toBe(true)
  })

  it('should drop format-illegal moves (isNonstandard) from the effective learnset', () => {
    // Champions marks Hidden Power / Tera Blast as isNonstandard:'Past'.
    // Sceptile's raw learnset still lists Hidden Power (the mod doesn't
    // override every species's learnset), so the helper must filter.
    const sceptile = getSpecies('sceptile')
    const learnset = effectiveLearnset(sceptile)
    expect('hiddenpower' in learnset).toBe(false)
    expect('terablast' in learnset).toBe(false)
  })
})

describe('Champions Mega species', () => {
  // @pkmn/mods/champions (0.10.10+) carries Pokedex/Species data for these
  // natively, so they resolve directly with no local patch.
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

  it('should resolve Floette-Mega with Fairy typing and Fairy Aura', () => {
    const mega = getSpecies('floettemega')
    expect(mega.exists).toBe(true)
    expect(mega.baseSpecies).toBe('Floette')
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
    expect(mega.baseSpecies).toBe('Meowstic')
  })

  it('should resolve bare Meowstic-Mega to the female form via SPECIES_ALIASES', () => {
    expect(SPECIES_ALIASES.get(toID('Meowstic-Mega'))).toBe('Meowstic-F-Mega')
  })
})

describe('getSpecies defaults', () => {
  it('should attach defaultNature/defaultMove/defaultAbility from the regulation', () => {
    const tflame = getSpecies('Talonflame')
    expect(tflame.defaultNature).toBe('Jolly')
    expect(tflame.defaultMove).toBe('Brave Bird')
    expect(tflame.defaultAbility).toBe('Gale Wings')
  })

  it('should fall back to the only ability when the forme has one (Megas)', () => {
    // CSV leaves ability blank for Megas — the forme has a single forced
    // ability via species.abilities, which the dex layer surfaces.
    const aero = getSpecies('Aerodactyl-Mega')
    expect(aero.defaultAbility).toBe('Tough Claws')
  })

  it('should leave defaults undefined for species without a curated entry', () => {
    const abomasnow = getSpecies('Abomasnow')
    expect(abomasnow.defaultNature).toBeUndefined()
    expect(abomasnow.defaultMove).toBeUndefined()
    // Multi-ability species with no CSV entry → no fallback.
    expect(abomasnow.defaultAbility).toBeUndefined()
  })
})

describe('Champions megas legality', () => {
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
