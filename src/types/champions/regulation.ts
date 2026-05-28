import type { z } from 'zod'

import type {
  itemNameSchema,
  mechanicSchema,
  speciesNameSchema,
} from '~/schemas/champions/regulation'

export type Mechanic = z.infer<typeof mechanicSchema>
export type AllSpeciesName = z.infer<typeof speciesNameSchema>
export type AllItemName = z.infer<typeof itemNameSchema>

// Generic over the species/item literal types so concrete regulations
// (e.g. `vgc2026_MA`) retain their literal-union element types when typed as
// `Regulation`. Default parameters fall back to the full known dex pools.
export type Regulation<
  S extends AllSpeciesName = AllSpeciesName,
  I extends AllItemName = AllItemName,
> = {
  readonly id: string
  readonly name: string
  readonly legalSpecies: readonly S[]
  readonly legalItems: readonly I[]
  readonly legalMechanics: readonly Mechanic[]
}
