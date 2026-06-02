import { z } from 'zod'

import { allItemNames } from '~/constants/all-items'
import { allMoveNames } from '~/constants/all-moves'
import { allSpeciesNames } from '~/constants/all-species'
import { natureSchema } from '~/schemas/stats'
import { uniqueArraySchema } from '~/schemas/utils'

// Generational gimmick mechanics. A regulation declares which (if any) are
// legal — the parser/calc consult this rather than per-mechanic feature flags.
export const mechanicSchema = z.enum([
  'mega-evolution',
  'z-moves',
  'dynamax',
  'terastallization',
])

// Validate against the full known @pkmn/dex pool (every species/item the gen
// 9 dex knows about, regardless of Champions legality). A regulation can pick
// any subset; typos or never-existed names fail at construction time.
export const speciesNameSchema = z.literal([...allSpeciesNames])
export const itemNameSchema = z.literal([...allItemNames])

// Per-species form-prefill seed. `move` is narrowed against the global
// `allMoveNames` snapshot (cycle-free); regulation-level legality of the
// move/ability is enforced at the per-species schema layer
// (championsPokemonSchema), which knows the active species's learnset.
export const speciesDefaultSchema = z.object({
  nature: natureSchema,
  move: z.literal([...allMoveNames]),
  ability: z.string().optional(),
})

export const regulationSchema = z.object({
  id: z.string(),
  name: z.string(),
  legalSpecies: uniqueArraySchema(speciesNameSchema).readonly(),
  legalItems: uniqueArraySchema(itemNameSchema).readonly(),
  legalMechanics: uniqueArraySchema(mechanicSchema).readonly(),
  // Partial record: a regulation only has to curate defaults for the species
  // its form actually prefills — missing entries pass validation and surface
  // as `undefined` defaults from `getSpecies(...)`.
  speciesDefaults: z.partialRecord(speciesNameSchema, speciesDefaultSchema),
})
