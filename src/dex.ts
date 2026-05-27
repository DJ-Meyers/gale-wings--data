// Curated per-species / per-item accessors over the @pkmn/mods/champions dex.
// The raw Dex instance is intentionally NOT exported — consumers go through
// these helpers for per-entity lookups, and through `currentRegulation` (or a
// named regulation) for legality questions. This keeps the mod as an
// implementation detail of shared-types rather than a public surface callers
// depend on directly.

import { Dex, type ID, type Item, type ModData, type Species } from '@pkmn/dex'
import * as champions from '@pkmn/mods/champions'

const dex = Dex.mod('champions' as ID, champions as ModData)

// Prime the Learnsets table at module load so synchronous reads off
// dex.data.Learnsets below (and in effectiveLearnset) don't return undefined.
// Makes this module async — consumers must await imports transitively.
await dex.learnsets.get('venusaur')

export const getSpecies = (name: string): Species => dex.species.get(name)
export const getItem = (name: string): Item => dex.items.get(name)
export const getMoveName = (id: string): string | undefined =>
  dex.moves.get(id)?.name

export const getAbilitiesOf = (speciesName: string): string[] =>
  Object.values(getSpecies(speciesName).abilities)

// Threshold separating "additive delta" formes (Rotom appliance: 1 move each)
// from "standalone learnset" formes (Alolan/Galarian/Hisuian/Paldean variants
// and gender forms: 41+ moves each). The Champions dex has no entries in
// between, so any low value safely partitions; 5 leaves margin for future
// additive formes that carry a handful of signature moves.
const ADDITIVE_FORME_LEARNSET_MAX = 5

// Return the effective learnset for a species. The Champions dex stores
// formes in three distinct shapes:
//   - Empty own (megas, Origin, battle-only formes like Cramorant-Gulping):
//     learnset comes entirely from the base species.
//   - Tiny own (Rotom-Wash/Heat/Frost/Fan/Mow — 1 signature move each):
//     additive delta on top of base; merge own ∪ base.
//   - Substantial own (Alolan/Galarian/Hisuian/Paldean variants, gender
//     forms): a standalone learnset distinct from base; use own as-is.
//     Merging here would let Alolan Ninetales learn Flamethrower.
// Without this routing, per-species schemas built off `species.id` directly
// would either degrade to an empty union (megas) or to a one-move union
// (Rotom forms), rejecting most legal spreads on those forms.
export const effectiveLearnset = (
  species: Species,
): Record<string, string[]> => {
  const own = dex.data.Learnsets?.[species.id]?.learnset ?? {}
  const isAdditiveForme = Object.keys(own).length < ADDITIVE_FORME_LEARNSET_MAX
  if (
    isAdditiveForme
    && species.baseSpecies
    && species.baseSpecies !== species.name
  ) {
    const baseId = dex.species.get(species.baseSpecies)?.id
    if (baseId) {
      const base = dex.data.Learnsets?.[baseId]?.learnset ?? {}
      return { ...base, ...own }
    }
  }
  return own
}

// Returns moves from the species's OWN learnset only — NOT the effective
// learnset. Used for computing the global legal-move pool. Walking to base
// (as effectiveLearnset does) would leak moves from non-legal base species
// (e.g. Hidden Power from base Floette, surfaced via Floette-Mega).
export const getOwnMoveNamesOf = (speciesName: string): string[] => {
  const id = getSpecies(speciesName)?.id
  const learnset = id ? (dex.data.Learnsets?.[id]?.learnset ?? {}) : {}
  return Object.keys(learnset)
    .map((id) => getMoveName(id))
    .filter((n): n is string => n != null)
}

// Returns moves from the species's effective learnset (walks to base for
// additive/empty-own formes). Used for per-species move validation, where a
// mega should be allowed any move its base form learns.
export const getEffectiveMoveNamesOf = (speciesName: string): string[] => {
  const learnset = effectiveLearnset(getSpecies(speciesName))
  return Object.keys(learnset)
    .map((id) => getMoveName(id))
    .filter((n): n is string => n != null)
}
