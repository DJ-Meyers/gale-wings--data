import { z } from 'zod'

import { TYPES } from '~/constants/types'
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

/** Sanity bounds for an explicit move base-power override. Real moves top out
 *  around ~250 (Explosion) / 350 (Rage Fist); 999 is a generous theorycraft cap.
 *  The `gale-wings--api` parser reuses this same bound when validating `<n>BP`. */
export const BASE_POWER_OVERRIDE_MIN = 1
export const BASE_POWER_OVERRIDE_MAX = 999

/** Bounds for the Supreme Overlord fallen-ally count. The mechanic caps at 5
 *  (the rest of a 6-mon party). The `gale-wings--api` parser reuses this bound. */
export const ALLIES_FAINTED_MIN = 0
export const ALLIES_FAINTED_MAX = 5

/** Global bounds for a multi-hit override. The widest in-game range is 1..10
 *  (Population Bomb hits 10). This is the permissive boundary-schema bound; the
 *  parser narrows it to the specific move's multihit range. */
export const HITS_MIN = 1
export const HITS_MAX = 10

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

// Derived from the canonical TYPES so it can't drift. '' means not
// terastallized in this calc. The typeless '???' is intentionally excluded —
// it's an edge-case type, never a real Tera type.
const teraTypeSchema = z.literal(['', ...TYPES] as const)

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
  // Optional with no .default — "absent" must stay distinguishable from "set,"
  // since the parser only emits this when a `<n>BP` token is present.
  basePowerOverride: z
    .number()
    .int()
    .min(BASE_POWER_OVERRIDE_MIN)
    .max(BASE_POWER_OVERRIDE_MAX)
    .optional(),
  // Optional, no .default — "absent" must stay distinguishable from a set value
  // (incl. an explicit 0); the parser only emits these when the matching token
  // is present.
  alliesFainted: z
    .number()
    .int()
    .min(ALLIES_FAINTED_MIN)
    .max(ALLIES_FAINTED_MAX)
    .optional(),
  // Permissive global range; per-move validity (e.g. Icicle Spear 2–5) is
  // enforced parser-side, mirroring how `move` is intentionally un-narrowed.
  hits: z.number().int().min(HITS_MIN).max(HITS_MAX).optional(),
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
