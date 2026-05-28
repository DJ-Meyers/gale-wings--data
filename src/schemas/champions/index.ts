import { Species } from '@pkmn/dex'
import z from 'zod'

import { currentRegulation } from '../../constants/champions/regulation'
import {
  effectiveLearnset,
  getAbilitiesOf,
  getMoveName,
  getOwnMoveNamesOf,
} from '../../dex'

const { legalSpecies, legalItems } = currentRegulation

// Derived from legal species' abilities, NOT from a global abilities table:
// abilities like Protosynthesis/Beads of Ruin aren't flagged isNonstandard
// themselves, but every Pokémon that carries them is — so the ability isn't
// actually legal in the current regulation.
const legalAbilities = Array.from(
  new Set(legalSpecies.flatMap((name) => getAbilitiesOf(name))),
)

// Derived from learnsets of legal species. Some moves (Milk Drink, Soft-Boiled,
// Spore, Power Shift) aren't flagged isNonstandard but their only learners are
// out of pool, so they aren't legal in practice.
const legalMoves = Array.from(
  new Set(legalSpecies.flatMap((name) => getOwnMoveNamesOf(name))),
)

const championsSpeciesNameSchema = z.literal([...legalSpecies])
const championsItemsSchema = z.literal([...legalItems])

const championsSpeciesAbilitiesSchema = (species: Species) =>
  z.literal(Object.values(species.abilities))

const championsAbilitiesSchema = z.literal(legalAbilities)

const championsSpeciesMovesSchema = (species: Species) => {
  // Walk up to the base species for formes without their own learnset
  // (megas, regional variants) — otherwise this collapses to z.literal([]),
  // which Zod rejects with "Cannot create literal schema with no valid values".
  const learnset = effectiveLearnset(species)
  const names: string[] = Object.keys(learnset)
    .map((id) => getMoveName(id))
    .filter((n): n is string => n != null)
  return z.literal(names as [string, ...string[]])
}

const championsMovesSchema = z.literal(legalMoves)

export {
  championsAbilitiesSchema,
  championsItemsSchema,
  championsMovesSchema,
  championsSpeciesAbilitiesSchema,
  championsSpeciesMovesSchema,
  championsSpeciesNameSchema,
}
