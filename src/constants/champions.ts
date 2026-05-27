import { Dex, type Item, type Species, type ID, type ModData } from '@pkmn/dex'
import * as champions from '@pkmn/mods/champions'

// Champions-mod dex instance — the single source of truth for the Champions
// pool (species/items/abilities/moves/learnsets). Schemas in
// ./schemas/champions.ts and the parser entity-maps in
// packages/server/src/parser/parser.ts both derive from this object.
export const championsDex = Dex.mod('champions' as ID, champions as ModData)

// Prime the Learnsets table at module load so the derived move list below
// (and any downstream sync access to championsDex.data.Learnsets) work
// without per-call priming. Makes this module async — consumers must await
// imports transitively.
await championsDex.learnsets.get('venusaur')

// --- Predicates: single source of truth for what counts as Champions-legal ---

/** A species is Champions-legal if it isn't flagged isNonstandard and isn't a cosmetic forme. */
export const isChampionsLegalSpecies = (s: Species): boolean =>
  s.isNonstandard == null && !s.isCosmeticForme

/** An item is Champions-legal if it isn't flagged isNonstandard. */
export const isChampionsLegalItem = (i: Item): boolean => i.isNonstandard == null

// --- Pre-filtered derived lists (computed once at module load) ---

/** All Champions-legal species (full Specie objects). */
export const championsLegalSpecies: Species[] = championsDex.species
  .all()
  .filter(isChampionsLegalSpecies)

/** All Champions-legal items (full Item objects). */
export const championsLegalItems: Item[] = championsDex.items
  .all()
  .filter(isChampionsLegalItem)

// Abilities and moves aren't naturally tagged isNonstandard at the per-entry
// level the way species/items are — Protosynthesis or Spore are valid abilities
// or moves in @pkmn/dex globally, but their only Champions-legal learners may
// be OOP. So we derive them from `championsLegalSpecies`' abilities/learnsets,
// mirroring the logic in `championsAbilitiesSchema` / `championsMovesSchema`.

/**
 * Champions-legal abilities — derived from `championsLegalSpecies`'s ability
 * slots, not by filtering `dex.abilities.all()`. Some abilities
 * (Protosynthesis, Beads of Ruin) aren't flagged isNonstandard themselves, but
 * every species that carries them is — so the ability isn't actually legal in
 * Champions.
 */
export const championsLegalAbilities: string[] = [
  ...new Set(
    championsLegalSpecies.flatMap((s) => Object.values(s.abilities)),
  ),
]

/**
 * Champions-legal moves — derived from `championsLegalSpecies`'s learnsets,
 * not by filtering `dex.moves.all()`. Some moves (Milk Drink, Soft-Boiled,
 * Spore, Power Shift) aren't flagged isNonstandard but their only learners are
 * non-Champions species, so they aren't legal in practice.
 */
export const championsLegalMoves: string[] = [
  ...new Set(
    championsLegalSpecies
      .flatMap((s) => Object.keys(championsDex.data.Learnsets?.[s.id]?.learnset ?? {}))
      .map((id) => championsDex.moves.get(id)?.name as string | undefined)
      .filter((n): n is string => n != null),
  ),
]

/**
 * Threshold separating "additive delta" formes (Rotom appliance: 1 move each)
 * from "standalone learnset" formes (Alolan/Galarian/Hisuian/Paldean variants
 * and gender forms: 41+ moves each). The Champions dex has no entries in
 * between, so any low value safely partitions; 5 leaves margin for future
 * additive formes that carry a handful of signature moves.
 */
const ADDITIVE_FORME_LEARNSET_MAX = 5

/**
 * Return the effective learnset for a species. The Champions dex stores
 * formes in three distinct shapes:
 *   - Empty own (megas, Origin, battle-only formes like Cramorant-Gulping):
 *     learnset comes entirely from the base species.
 *   - Tiny own (Rotom-Wash/Heat/Frost/Fan/Mow — 1 signature move each):
 *     additive delta on top of base; merge own ∪ base.
 *   - Substantial own (Alolan/Galarian/Hisuian/Paldean variants, gender
 *     forms): a standalone learnset distinct from base; use own as-is.
 *     Merging here would let Alolan Ninetales learn Flamethrower.
 * Without this routing, per-species schemas built off `species.id` directly
 * would either degrade to an empty union (megas) or to a one-move union
 * (Rotom forms), rejecting most legal spreads on those forms.
 */
export const championsEffectiveLearnset = (
  species: Species,
): Record<string, string[]> => {
  const own = championsDex.data.Learnsets?.[species.id]?.learnset ?? {}
  const isAdditiveForme = Object.keys(own).length < ADDITIVE_FORME_LEARNSET_MAX
  if (
    isAdditiveForme &&
    species.baseSpecies &&
    species.baseSpecies !== species.name
  ) {
    const baseId = championsDex.species.get(species.baseSpecies)?.id
    if (baseId) {
      const base = championsDex.data.Learnsets?.[baseId]?.learnset ?? {}
      return { ...base, ...own }
    }
  }
  return own
}
