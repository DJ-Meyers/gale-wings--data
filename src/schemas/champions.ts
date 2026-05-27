import { Species } from '@pkmn/dex'
import z from 'zod'

import {
  championsDex,
  championsEffectiveLearnset,
  championsLegalAbilities,
  championsLegalItems,
  championsLegalMoves,
  championsLegalSpecies,
} from '../constants/champions'

const championsSpeciesNameSchema = z.literal([
  ...championsLegalSpecies.map((s) => s.name),
])

type ChampionsSpeciesName = z.infer<typeof championsSpeciesNameSchema>

const championsItemsSchema = z.literal(championsLegalItems.map((i) => i.name))

const championsSpeciesAbilitiesSchema = (species: Species) =>
  z.literal(Object.values(species.abilities))

// Derived from legal species' abilities, NOT from filtering `dex.abilities.all()`:
// abilities like Protosynthesis/Beads of Ruin aren't flagged isNonstandard themselves,
// but every Pokémon that carries them is — so the ability isn't actually legal in Champions.
const championsAbilitiesSchema = z.literal([...championsLegalAbilities])

const championsSpeciesMovesSchema = (species: Species) => {
  // Walk up to the base species for formes without their own learnset
  // (megas, regional variants) — otherwise this collapses to z.literal([]),
  // which Zod rejects with "Cannot create literal schema with no valid values".
  const learnset = championsEffectiveLearnset(species)
  const names: string[] = Object.keys(learnset)
    .map((id) => championsDex.moves.get(id)?.name as string | undefined)
    .filter((n): n is string => n != null)
  return z.literal(names as [string, ...string[]])
}

// Derived from learnsets of legal species, NOT from filtering `dex.moves.all()`.
// Some moves (Milk Drink, Soft-Boiled, Spore, Power Shift) aren't flagged isNonstandard
// but their only learners are non-Champions species, so they aren't legal in practice.
const championsMovesSchema = z.literal([...championsLegalMoves])

export {
  championsDex,
  type ChampionsSpeciesName,
  championsAbilitiesSchema,
  championsItemsSchema,
  championsMovesSchema,
  championsSpeciesAbilitiesSchema,
  championsSpeciesMovesSchema,
  championsSpeciesNameSchema,
}
