import type { Species } from '@pkmn/dex'

import { getSpecies } from '../dex'
import manifestJson from './manifest.json'

export interface SpriteManifest {
  generatedAt: string
  source: { repo: string; ref: string; path: string }
  baseUrl: string
  spriteWidth: number
  spriteHeight: number
  entries: Record<string, string>
}

export const spriteManifest: SpriteManifest = manifestJson

/**
 * Resolve a sprite URL for a Pokémon. Returns undefined if the species is
 * unknown or has no entry in the bundled manifest.
 *
 * Accepts a species name (canonical or alias) or a Species object. Strings
 * are routed through getSpecies() so aliases like 'KG' (→ Kingambit) and
 * 'Meowstic-Mega' (→ Meowstic-F-Mega) resolve to the right URL.
 */
export function getSpriteUrl(
  pokemon: string | Species,
  options?: { shiny?: boolean },
): string | undefined {
  const species = typeof pokemon === 'string' ? getSpecies(pokemon) : pokemon
  if (!species?.name) return undefined
  const sid = spriteManifest.entries[species.name]
  if (!sid) return undefined
  const file = options?.shiny ? `${sid}-s.png` : `${sid}.png`
  return `${spriteManifest.baseUrl}${file}`
}
