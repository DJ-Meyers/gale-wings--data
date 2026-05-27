import type { z } from 'zod'

import type { mechanicSchema } from '../schemas/regulation'

export type Mechanic = z.infer<typeof mechanicSchema>

// Generic over the species/item literal types so concrete regulations
// (e.g. `vgc2026M_A`) retain their literal-union element types when typed as
// `Regulation`. Default parameters fall back to `string` for cross-regulation
// code that doesn't need to narrow.
export type Regulation<
  S extends string = string,
  I extends string = string,
> = {
  readonly id: string
  readonly legalSpecies: readonly S[]
  readonly legalItems: readonly I[]
  readonly legalMechanics: readonly Mechanic[]
}
