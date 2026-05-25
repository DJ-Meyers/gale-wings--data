import type { z } from 'zod'

import type {
  championsAbilitiesSchema,
  championsItemsSchema,
  championsMovesSchema,
  championsSpeciesNameSchema,
} from '../schemas/champions'
import type { statusSchema, teraTypeSchema } from '../schemas/pokemon'
import type { statAlignmentSchema } from '../schemas/stats'

export type ChampionsAbility = z.infer<typeof championsAbilitiesSchema>
export type ChampionsItem = z.infer<typeof championsItemsSchema>
export type ChampionsMove = z.infer<typeof championsMovesSchema>
export type ChampionsSpecies = z.infer<typeof championsSpeciesNameSchema>
export type StatAlignment = z.infer<typeof statAlignmentSchema>
export type Status = z.infer<typeof statusSchema>
export type TeraType = z.infer<typeof teraTypeSchema>

// Augmentation literal unions kept inline so shared-types stays self-contained
// (no cross-package import of server/parser constants). These mirror the lists
// in packages/server/src/parser/constants.ts — keep in sync if those expand.
type ParadoxAbility = 'Protosynthesis' | 'Quark Drive'
type RuinAbility =
  | 'Beads of Ruin'
  | 'Sword of Ruin'
  | 'Tablets of Ruin'
  | 'Vessel of Ruin'
type LegendaryWeatherAbility = 'Orichalcum Pulse' | 'Hadron Engine'

// Wider ability type used by ParseResult: covers gated augmentation abilities
// (Paradox/Ruin/legendary weather) that the parser injects into abilityById
// when feature flags are on, even though they aren't part of the strict
// Champions pool reflected in ChampionsAbility.
export type ParseableAbility =
  | ChampionsAbility
  | ParadoxAbility
  | RuinAbility
  | LegendaryWeatherAbility

// Alias targets enumerated as pure string literal unions (rather than
// extending ChampionsSpecies / ChampionsItem) because the @pkmn-derived
// inferred types are branded nominal types (SpeciesName / ItemName), so
// a `ChampionsSpecies | 'Foo'` union would fall back to the brand and
// not narrow assignments of bare string literals.
//
// These cover every target in SPECIES_ALIASES / ITEM_ALIASES in
// packages/server/src/parser/constants.ts, including roster-expansion
// candidates that are currently OOP (see project_champions_evolves
// memory) — the parser drops OOP targets at runtime through the
// speciesById / itemById lookup filter added in PR5. The literal union
// here documents intent; the use site narrows back to the strict
// ChampionsSpecies / ChampionsItem brand via the map lookup result.
export type SpeciesAliasTarget =
  | 'Blissey'
  | 'Calyrex-Ice'
  | 'Calyrex-Shadow'
  | 'Charizard'
  | 'Clefable'
  | 'Corviknight'
  | 'Cresselia'
  | 'Deoxys-Attack'
  | 'Deoxys-Speed'
  | 'Dragapult'
  | 'Ferrothorn'
  | 'Flutter Mane'
  | 'Garchomp'
  | 'Gardevoir'
  | 'Gholdengo'
  | 'Gouging Fire'
  | 'Great Tusk'
  | 'Hippowdon'
  | 'Incineroar'
  | 'Iron Bundle'
  | 'Iron Hands'
  | 'Iron Moth'
  | 'Iron Treads'
  | 'Iron Valiant'
  | 'Kingambit'
  | 'Landorus-Incarnate'
  | 'Landorus-Therian'
  | 'Ogerpon'
  | 'Raging Bolt'
  | 'Rillaboom'
  | 'Roaring Moon'
  | 'Salamence'
  | 'Skarmory'
  | 'Swampert'
  | 'Tapu Bulu'
  | 'Tapu Fini'
  | 'Tapu Koko'
  | 'Tapu Lele'
  | 'Thundurus-Therian'
  | 'Tornadus-Therian'
  | 'Toxapex'
  | 'Tyranitar'
  | 'Ursaluna-Bloodmoon'
  | 'Walking Wake'
  | 'Weavile'

export type ItemAliasTarget =
  | 'Assault Vest'
  | 'Choice Band'
  | 'Choice Scarf'
  | 'Choice Specs'
  | 'Eviolite'
  | 'Focus Sash'
  | 'Heavy-Duty Boots'
  | 'Leftovers'
  | 'Life Orb'
  | 'Lum Berry'
  | 'Sitrus Berry'
