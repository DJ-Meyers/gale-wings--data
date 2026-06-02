import { describe, expect, it } from 'vitest'

import { championsMegaSpeciesPatch } from '../constants/champions/mega-species-patch'
import { getSpecies } from '../dex'
import { getSpriteUrl, spriteManifest } from './index'

describe('getSpriteUrl', () => {
  it.each([
    'Floette-Mega',
    'Drampa-Mega',
    'Meowstic-F-Mega',
    'Meowstic-M-Mega',
    'Hawlucha-Mega',
  ])('resolves Champions-only Mega %s', (name) => {
    expect(getSpriteUrl(name)).toMatch(/cdn\.jsdelivr\.net.*\/s\d+\.png$/)
  })

  it('routes Meowstic-Mega alias to female default', () => {
    expect(getSpriteUrl('Meowstic-Mega')).toContain('s21699')
  })

  it('routes KG alias to Kingambit', () => {
    expect(getSpriteUrl('KG')).toBeDefined()
    expect(getSpriteUrl('KG')).toBe(getSpriteUrl('Kingambit'))
  })

  it('returns shiny URL when shiny: true', () => {
    const url = getSpriteUrl('Charizard-Mega-Y', { shiny: true })
    expect(url).toMatch(/-s\.png$/)
  })

  it('returns undefined for unknown species', () => {
    expect(getSpriteUrl('NotARealPokemon')).toBeUndefined()
  })

  it('accepts a Species object', () => {
    expect(getSpriteUrl(getSpecies('Charizard-Mega-Y'))).toBeDefined()
  })

  // Drift detection: every Champions-only Mega in the patch must have a
  // sprite. A future patch that adds a species without refreshing the
  // manifest fails CI immediately.
  it('has a sprite for every Champions-only Mega in the patch', () => {
    const missing = Object.values(championsMegaSpeciesPatch)
      .map((s) => s?.name)
      .filter((name): name is string => name != null)
      .filter((name) => !getSpriteUrl(name))
    expect(missing).toEqual([])
  })

  it('manifest baseUrl is SHA-pinned for cache immutability', () => {
    expect(spriteManifest.baseUrl).toMatch(/@[0-9a-f]{40}\//)
  })
})
