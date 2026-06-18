// Curated per-species / per-item accessors over the @pkmn/mods/champions dex.
// The raw Dex instance is intentionally NOT exported — consumers go through
// these helpers for per-entity lookups, and through `currentRegulation` (or a
// named regulation) for legality questions. The mod is what trims learnsets
// to Champions-legal moves and pins forme metadata (e.g. Floette-Mega's
// baseSpecies → Floette-Eternal); plain @pkmn/dex carries Champions Megas
// natively now but still over-includes the moves Champions removes.

import { Dex, type ID, type Item, type ModData, type Species } from '@pkmn/dex'
import * as champions from '@pkmn/mods/champions'

import { SPECIES_ALIASES } from './aliases'
import { currentRegulation } from './constants/champions/regulation'
import type {
  AllSpeciesName,
  SpeciesDefault,
} from './types/champions/regulation'

const dex = Dex.mod('champions' as ID, champions as ModData)

// Fold our typed SPECIES_ALIASES map into the dex's alias table so
// `dex.species.get(alias)` honours the same mappings consumers get from
// SPECIES_ALIASES.get(...) — single source of truth in species-aliases.ts.
// ModData.Aliases is silently ignored by Dex.mod (its loader hard-reads the
// shared @pkmn/dex DATA), so the override has to happen on the constructed
// dex. Spread into a fresh object so we don't mutate the shared reference.
//
// Notable consequence: this also overrides upstream's 'Meowstic-Mega' →
// male default with our 'Meowstic-Mega' → female mapping, since the stats
// are identical and Floette/Meowstic users typically default to F.
dex.data.Aliases = {
  ...dex.data.Aliases,
  ...Object.fromEntries(SPECIES_ALIASES),
}

// Prime the Learnsets table at module load so synchronous reads off
// dex.data.Learnsets below (and in effectiveLearnset) don't return undefined.
// Makes this module async — consumers must await imports transitively.
await dex.learnsets.get('venusaur')

// Species returned by getSpecies, augmented with form-prefill defaults sourced
// from `currentRegulation.speciesDefaults`. Fields are undefined when the
// species has no curated default in the current regulation. `defaultAbility`
// additionally falls back to the species's only ability when the forme is
// single-ability (most Megas) — matching the CSV convention of leaving the
// ability cell blank for forced-ability formes.
export type SpeciesWithDefaults = Species & {
  defaultNature?: SpeciesDefault['nature']
  defaultMove?: SpeciesDefault['move']
  defaultAbility?: string
}

const attachDefaults = (species: Species): SpeciesWithDefaults => {
  const augmented = species as SpeciesWithDefaults
  // Idempotent: @pkmn/dex caches Species instances, so subsequent calls hit
  // the same object. Re-assigning the same values is cheap and avoids a
  // sentinel flag.
  // Widen to the regulation's full key space — the literal type of
  // `speciesDefaults` only includes keys we've actually populated, so indexing
  // by an arbitrary species name needs the Partial<Record<…>> view.
  const defaults: Partial<Record<AllSpeciesName, SpeciesDefault>> =
    currentRegulation.speciesDefaults
  const seed = defaults[species.name as AllSpeciesName]
  augmented.defaultNature = seed?.nature
  augmented.defaultMove = seed?.move
  const abilities = Object.values(species.abilities)
  augmented.defaultAbility =
    seed?.ability ?? (abilities.length === 1 ? abilities[0] : undefined)
  return augmented
}

export const getSpecies = (name: string): SpeciesWithDefaults =>
  attachDefaults(dex.species.get(name))
export const getItem = (name: string): Item => dex.items.get(name)
export const getMoveName = (id: string): string | undefined =>
  dex.moves.get(id)?.name

// Champions bans moves at the move level via isNonstandard. The mod overrides
// some species' learnsets but not all (Floette, Annihilape, Pyroar, Eelektross,
// …) — those inherit Gen 9 vanilla data and still surface Past moves like
// Tera Blast / Hidden Power in their raw learnset. Filter at the helper layer
// so both global and per-species move pools agree with the format ruleset.
const isFormatLegalMoveId = (id: string): boolean =>
  !dex.data.Moves?.[id]?.isNonstandard

export const getAbilitiesOf = (speciesName: string): string[] =>
  Object.values(getSpecies(speciesName).abilities)

// Threshold separating "additive delta" formes (Rotom appliance: 1 move each)
// from "standalone learnset" formes (Alolan/Galarian/Hisuian/Paldean variants
// and gender forms: 41+ moves each). Gen 9 has no entries in between, so any
// low value safely partitions; 5 leaves margin for future additive formes
// that carry a handful of signature moves.
const ADDITIVE_FORME_LEARNSET_MAX = 5

// Return the effective learnset for a species. Gen 9 stores formes in three
// distinct shapes:
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
// Battle-only formes (Megas, Primal Reversion, Zen Mode, Tatsugiri-Mega …)
// carry a `battleOnly` pointer to the specific forme they revert to outside
// battle. When upstream sets `baseSpecies` to the generic species but
// `battleOnly` to a specific forme (Floette-Mega → Floette-Eternal,
// Meowstic-F-Mega → Meowstic-F), the learnset lives on the specific forme;
// walking via `baseSpecies` would land on the wrong (often empty) pool. Prefer
// `battleOnly` when present; array form (Zygarde-Mega) picks the first.
const baseFormeForLearnset = (species: Species): string | undefined => {
  const bo = species.battleOnly
  const fromBattleOnly = Array.isArray(bo) ? bo[0] : bo
  return fromBattleOnly ?? species.baseSpecies
}

const filterFormatLegal = (
  learnset: Record<string, string[]>,
): Record<string, string[]> =>
  Object.fromEntries(
    Object.entries(learnset).filter(([id]) => isFormatLegalMoveId(id)),
  )

export const effectiveLearnset = (
  species: Species,
): Record<string, string[]> => {
  const own = dex.data.Learnsets?.[species.id]?.learnset ?? {}
  const isAdditiveForme = Object.keys(own).length < ADDITIVE_FORME_LEARNSET_MAX
  const base = baseFormeForLearnset(species)
  if (isAdditiveForme && base && base !== species.name) {
    const baseId = dex.species.get(base)?.id
    if (baseId) {
      const baseLearnset = dex.data.Learnsets?.[baseId]?.learnset ?? {}
      return filterFormatLegal({ ...baseLearnset, ...own })
    }
  }
  return filterFormatLegal(own)
}

const learnsetMoveNames = (learnset: Record<string, string[]>): string[] =>
  Object.keys(learnset)
    .filter(isFormatLegalMoveId)
    .map((id) => getMoveName(id))
    .filter((n): n is string => n != null)

// Moves from the species's OWN learnset, filtered to format-legal moves.
// Used to build the global legal-move pool — narrower than effective because
// it doesn't fold base-forme moves onto the species (e.g. Floette-Mega's own
// pool is empty and contributes nothing).
export const getOwnMoveNamesOf = (speciesName: string): string[] => {
  const id = getSpecies(speciesName)?.id
  const learnset = id ? (dex.data.Learnsets?.[id]?.learnset ?? {}) : {}
  return learnsetMoveNames(learnset)
}

// Moves from the species's effective learnset (walks to battleOnly/base for
// additive or empty-own formes), filtered to format-legal moves. Used for
// per-species move validation: a mega should be allowed any move its real
// base form learns.
export const getEffectiveMoveNamesOf = (speciesName: string): string[] =>
  learnsetMoveNames(effectiveLearnset(getSpecies(speciesName)))
