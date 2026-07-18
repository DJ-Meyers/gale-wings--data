import type { PokemonType } from './types'

// Background colors for the 18 damage types plus Stellar — the standard
// type-color palette, used for type-hued UI (move chips, type badges). Keyed by
// PokemonType so the map stays exhaustive: a new type won't compile until it has
// a color.
export const TYPE_COLORS: Record<PokemonType, string> = {
  Normal: '#9099A1',
  Fire: '#EE8130',
  Water: '#6390F0',
  Electric: '#D9A400',
  Grass: '#63BC5A',
  Ice: '#74CEC0',
  Fighting: '#CE4069',
  Poison: '#AB5ACA',
  Ground: '#D97845',
  Flying: '#8FA9DE',
  Psychic: '#F97176',
  Bug: '#90C12C',
  Rock: '#C7B78B',
  Ghost: '#5269AD',
  Dragon: '#0B6DC3',
  Dark: '#5A5366',
  Steel: '#5A8EA1',
  Fairy: '#EC8FE6',
  Stellar: '#40B5A5',
}

// Neutral gray fallback for an absent/unknown type (e.g. a typeless move).
const NEUTRAL = '#6B7280'

export const typeColor = (type: PokemonType | undefined): string =>
  (type && TYPE_COLORS[type]) || NEUTRAL
