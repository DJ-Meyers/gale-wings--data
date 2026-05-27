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
 * Return the effective learnset for a species, walking up to the base species
 * when the form (mega, regional, gender-locked) doesn't carry its own. The
 * Champions dex doesn't duplicate learnsets onto every forme — `Learnsets[
 * "charizardmegay"]` is missing while `Learnsets["charizard"]` is populated,
 * so per-species schemas built off `species.id` directly would degrade to an
 * empty literal union and throw at construction.
 */
export const championsEffectiveLearnset = (
  species: Species,
): Record<string, string[]> => {
  const own = championsDex.data.Learnsets?.[species.id]?.learnset
  if (own && Object.keys(own).length > 0) return own
  if (species.baseSpecies && species.baseSpecies !== species.name) {
    const baseId = championsDex.species.get(species.baseSpecies)?.id
    if (baseId) {
      return championsDex.data.Learnsets?.[baseId]?.learnset ?? {}
    }
  }
  return own ?? {}
}
