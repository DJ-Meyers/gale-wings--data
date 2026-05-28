import { z } from 'zod'

import { allItemNames } from '../../constants/all-items'
import { allSpeciesNames } from '../../constants/all-species'

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

export const regulationSchema = z.object({
  id: z.string(),
  name: z.string(),
  legalSpecies: z.array(speciesNameSchema).readonly(),
  legalItems: z.array(itemNameSchema).readonly(),
  legalMechanics: z.array(mechanicSchema).readonly(),
})
