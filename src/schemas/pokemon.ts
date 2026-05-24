import { z } from 'zod'

import { statAlignmentSchema, statBoostsSchema, statPointsSchema } from './stats'
import { championsAbilitiesSchema, championsDex, championsItemsSchema, championsMovesSchema, championsSpeciesAbilitiesSchema, championsSpeciesMovesSchema, championsSpeciesNameSchema, type ChampionsSpeciesName, } from './champions';
import { uniqueArraySchema } from './utils';


const championsPokemonSchema = (speciesName: ChampionsSpeciesName) => {
  const species = championsDex.species.get(speciesName);
  return z.object({
    species: z.literal(speciesName),
    statAlignment: statAlignmentSchema,
    ability: championsSpeciesAbilitiesSchema(species),
    item: championsItemsSchema.optional(),
    statPoints: statPointsSchema,
    moves: uniqueArraySchema(championsSpeciesMovesSchema(species)).max(4)
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

const statusSchema = z.literal([
  '', 'slp', 'psn', 'brn', 'frz', 'par', 'tox',
])

const pokemonModifiersSchema = z.object({
  teraType: teraTypeSchema,
  statBoosts: statBoostsSchema,
  status: statusSchema,
  isCrit: z.boolean(),
  abilityOn: z.boolean(),
  abilityOverride: championsAbilitiesSchema
})

const championsPokemonWithModifiersSchema = (speciesName: ChampionsSpeciesName) => z.object({
  ...championsPokemonSchema(speciesName).shape,
  ...pokemonModifiersSchema.shape
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
  championsDex,
  championsPokemonSchema,
  championsPokemonWithModifiersSchema,
  looseChampionsPokemonSchema,
  pokemonModifiersSchema,
}