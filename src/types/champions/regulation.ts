import type { z } from 'zod'

import type { allMoveNames } from '~/constants/all-moves'
import type {
  itemNameSchema,
  mechanicSchema,
  speciesDefaultSchema,
  speciesNameSchema,
} from '~/schemas/champions/regulation'

export type Mechanic = z.infer<typeof mechanicSchema>
export type AllSpeciesName = z.infer<typeof speciesNameSchema>
export type AllItemName = z.infer<typeof itemNameSchema>
// No runtime validation for moves at the type-export level — type only,
// derived directly from the snapshot. Used by `*-aliases.ts` to constrain
// alias keys; `speciesDefaultSchema` narrows `move` against this same pool.
export type AllMoveName = (typeof allMoveNames)[number]

// Form-prefill defaults: the nature / signature move / ability auto-populated
// when the user picks a species before filling the rest of the form. `ability`
// is omitted for formes with a single forced ability (most Megas) — the dex
// layer falls back to `species.abilities[0]` in that case.
export type SpeciesDefault = z.infer<typeof speciesDefaultSchema>

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
  readonly speciesDefaults: Partial<Record<S, SpeciesDefault>>
}
