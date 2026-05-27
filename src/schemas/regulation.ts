import { z } from 'zod'

// Generational gimmick mechanics. A regulation declares which (if any) are
// legal — the parser/calc consult this rather than per-mechanic feature flags.
export const mechanicSchema = z.enum([
  'mega-evolution',
  'z-moves',
  'dynamax',
  'terastallization',
])

// `legalSpecies` and `legalItems` are stored as plain strings (not branded
// @pkmn/dex name unions) so historical regulations remain representable even
// after a species/item is removed from the current dex. Strict cross-checks
// against the active dex should live next to the consumer that needs them.
export const regulationSchema = z.object({
  id: z.string(),
  legalSpecies: z.array(z.string()).readonly(),
  legalItems: z.array(z.string()).readonly(),
  legalMechanics: z.array(mechanicSchema).readonly(),
})
