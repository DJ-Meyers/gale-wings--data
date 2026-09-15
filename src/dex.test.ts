import { toID } from '@smogon/calc'
import { describe, expect, it } from 'vitest'

import { SPECIES_ALIASES } from './aliases'
import { vgc2026_MA, vgc2026_MC } from './constants/champions/regulation'
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

describe('M-C Mega species patch', () => {
  // The installed @pkmn/dex (0.10.11) carries stale pre-release Z-A abilities
  // for the M-C Z-Megas; the generated showdown-patch Species overlay
  // corrects them from Showdown master's pokedex at the pin. Stats/types/
  // weights are identical upstream and flow through unpatched.
  it('should resolve Absol-Mega-Z as Dark/Ghost with Sharpness', () => {
    const mega = getSpecies('absolmegaz')
    expect(mega.exists).toBe(true)
    expect(mega.types).toEqual(['Dark', 'Ghost'])
    expect(mega.abilities).toEqual({ 0: 'Sharpness' })
    expect(mega.baseStats).toEqual({
      hp: 65,
      atk: 154,
      def: 60,
      spa: 75,
      spd: 60,
      spe: 151,
    })
    expect(mega.requiredItem).toBe('Absolite Z')
  })

  it('should resolve Golisopod-Mega as Bug/Steel with Tough Claws', () => {
    const mega = getSpecies('golisopodmega')
    expect(mega.types).toEqual(['Bug', 'Steel'])
    expect(mega.abilities).toEqual({ 0: 'Tough Claws' })
    expect(mega.baseStats.def).toBe(175)
  })

  it('should resolve Baxcalibur-Mega with a single forced ability', () => {
    // Installed dex copies base Baxcalibur's {0, H} table onto the forme;
    // the patch restores the forced single ability so the defaults layer's
    // single-ability fallback fires.
    const mega = getSpecies('baxcaliburmega')
    expect(mega.types).toEqual(['Dragon', 'Ice'])
    expect(mega.abilities).toEqual({ 0: 'Thermal Exchange' })
    expect(mega.baseStats.atk).toBe(175)
  })

  it('should resolve Garchomp-Mega-Z with Levitate', () => {
    const mega = getSpecies('garchompmegaz')
    expect(mega.types).toEqual(['Dragon'])
    expect(mega.abilities).toEqual({ 0: 'Levitate' })
  })

  it('should resolve Lucario-Mega-Z with Aura Guard', () => {
    // Champions-new ability, implemented by @smogon/calc from 0.12.0; on an
    // older calc an unknown ability is simply a no-op, so no stand-in.
    const mega = getSpecies('lucariomegaz')
    expect(mega.abilities).toEqual({ 0: 'Aura Guard' })
    expect(mega.baseStats.spa).toBe(164)
  })

  it('should leave official Gen 6 Salamence-Mega unpatched (Aerilate)', () => {
    const mega = getSpecies('salamencemega')
    expect(mega.abilities).toEqual({ 0: 'Aerilate' })
    expect(mega.baseStats.def).toBe(130)
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

  it('should prefill an M-C species from the M-C defaults table (Rillaboom)', () => {
    const rilla = getSpecies('Rillaboom')
    expect(rilla.defaultNature).toBe('Adamant')
    expect(rilla.defaultMove).toBe('Grassy Glide')
    expect(rilla.defaultAbility).toBe('Grassy Surge')
  })

  it('should fall back to the patched forced ability for Baxcalibur-Mega', () => {
    // The CSV leaves the mega row's ability blank; the single-ability
    // fallback only fires because the showdown-patch Species overlay drops
    // the stale hidden ability the installed dex copied from base Baxcalibur.
    const mega = getSpecies('Baxcalibur-Mega')
    expect(mega.defaultNature).toBe('Adamant')
    expect(mega.defaultMove).toBe('Glaive Rush')
    expect(mega.defaultAbility).toBe('Thermal Exchange')
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

  it.each([
    'Salamence-Mega',
    'Golisopod-Mega',
    'Baxcalibur-Mega',
    'Absol-Mega-Z',
    'Garchomp-Mega-Z',
    'Lucario-Mega-Z',
  ])('should list %s in vgc2026_MC.legalSpecies', (name) => {
    expect(vgc2026_MC.legalSpecies).toContain(name)
  })
})
