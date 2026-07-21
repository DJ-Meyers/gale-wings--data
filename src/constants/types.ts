// The canonical Pokémon types: the 18 damage types plus Stellar, in the standard
// in-game ordering. This is the single source of truth for type names across the
// ecosystem (calc, schemas, client UI). It deliberately excludes the typeless
// '???' placeholder from older generations — no current move or species uses it.
export const TYPES = [
  'Normal',
  'Fire',
  'Water',
  'Grass',
  'Electric',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
  'Stellar',
] as const

export type PokemonType = (typeof TYPES)[number]
