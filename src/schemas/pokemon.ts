import { z } from 'zod'

import { getSpecies } from '~/dex'
import type { ChampionsSpecies } from '~/types/champions'
import {
  championsAbilitiesSchema,
  championsItemsSchema,
  championsMovesSchema,
  championsSpeciesAbilitiesSchema,
  championsSpeciesMovesSchema,
  championsSpeciesNameSchema,
} from './champions'
import {
  statAlignmentSchema,
  statBoostsSchema,
  statPointsSchema,
} from './stats'
import { uniqueArraySchema } from './utils'

const championsPokemonSchema = (speciesName: ChampionsSpecies) => {
  const species = getSpecies(speciesName)
  return z.object({
    species: z.literal(speciesName),
    statAlignment: statAlignmentSchema,
    ability: championsSpeciesAbilitiesSchema(species),
    item: championsItemsSchema.optional(),
    statPoints: statPointsSchema,
    moves: uniqueArraySchema(championsSpeciesMovesSchema(species)).max(4),
  })
}

const teraTypeSchema = z.literal([
  '',
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
  'stellar',
])

const statusSchema = z.literal(['', 'slp', 'psn', 'brn', 'frz', 'par', 'tox'])

const pokemonModifiersSchema = z.object({
  teraType: teraTypeSchema,
  statBoosts: statBoostsSchema,
  status: statusSchema,
  isCrit: z.boolean(),
  abilityOn: z.boolean(),
  abilityOverride: championsAbilitiesSchema,
})

const championsPokemonWithModifiersSchema = (speciesName: ChampionsSpecies) =>
  z.object({
    ...championsPokemonSchema(speciesName).shape,
    ...pokemonModifiersSchema.shape,
  })

// Boundary schema: validates each field against the global Champions-legal pool
// but does NOT enforce per-species relationships (e.g. ability must be in THIS species's ability list).
// Use at API/DB boundaries where the species isn't known up front, then re-parse with
// championsPokemonSchema(opponent.species) inside handlers for full strict validation.
const looseChampionsPokemonSchema = z.object({
  species: championsSpeciesNameSchema,
  statAlignment: statAlignmentSchema,
  ability: championsAbilitiesSchema,
  item: championsItemsSchema.optional(),
  statPoints: statPointsSchema,
  moves: uniqueArraySchema(championsMovesSchema).max(4),
})

export {
  championsPokemonSchema,
  championsPokemonWithModifiersSchema,
  looseChampionsPokemonSchema,
  pokemonModifiersSchema,
  statusSchema,
  teraTypeSchema,
}
