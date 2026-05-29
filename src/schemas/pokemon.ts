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
  boostsSchema,
  ivsSchema,
  natureSchema,
  statPointsSchema,
} from './stats'
import { uniqueArraySchema } from './utils'

const championsPokemonSchema = (speciesName: ChampionsSpecies) => {
  const species = getSpecies(speciesName)
  return z.object({
    species: z.literal(speciesName),
    nature: natureSchema,
    ability: championsSpeciesAbilitiesSchema(species),
    item: championsItemsSchema.optional(),
    statPoints: statPointsSchema,
    ivs: ivsSchema,
    moves: uniqueArraySchema(championsSpeciesMovesSchema(species)).max(4),
  })
}

const teraTypeSchema = z.literal([
  '',
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
  '???',
])

const statusSchema = z.literal(['', 'slp', 'psn', 'brn', 'frz', 'par', 'tox'])

const calcParametersSchema = z.object({
  // Intentionally NOT narrowed to species learnset — Copycat / Mirror Move /
  // Sleep Talk / Me First all let a Pokemon execute off-pool moves in real
  // battles. The calc still wants to model these scenarios.
  move: z.union([championsMovesSchema, z.literal('')]).default(''),
  teraType: teraTypeSchema, // '' = not terastallized in this calc
  boosts: boostsSchema,
  status: statusSchema,
  isCrit: z.boolean().default(false),
  abilityOn: z.boolean().default(false),
  // Intentionally NOT narrowed to species abilities — Skill Swap / Trace /
  // Role Play / Receiver can grant any ability from another Pokemon.
  abilityOverride: championsAbilitiesSchema.optional(),
  boostedStat: z
    .enum(['', 'atk', 'def', 'spa', 'spd', 'spe', 'auto'])
    .default(''),
})

const championsPokemonWithCalcParametersSchema = (speciesName: ChampionsSpecies) =>
  z.object({
    ...championsPokemonSchema(speciesName).shape,
    ...calcParametersSchema.shape,
  })

// Boundary schema: validates each field against the global Champions-legal pool
// but does NOT enforce per-species relationships (e.g. ability must be in THIS species's ability list).
// Use at API/DB boundaries where the species isn't known up front, then re-parse with
// championsPokemonSchema(opponent.species) inside handlers for full strict validation.
const looseChampionsPokemonSchema = z.object({
  species: championsSpeciesNameSchema,
  nature: natureSchema,
  ability: championsAbilitiesSchema,
  item: championsItemsSchema.optional(),
  statPoints: statPointsSchema,
  ivs: ivsSchema,
  moves: uniqueArraySchema(championsMovesSchema).max(4),
})

export {
  calcParametersSchema,
  championsPokemonSchema,
  championsPokemonWithCalcParametersSchema,
  looseChampionsPokemonSchema,
  statusSchema,
  teraTypeSchema,
}
