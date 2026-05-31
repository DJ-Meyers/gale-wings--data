import type { z } from 'zod'

import type {
  championsAbilitiesSchema,
  championsItemsSchema,
  championsMovesSchema,
  championsSpeciesNameSchema,
} from '~/schemas/champions'
import type { statusSchema, teraTypeSchema } from '~/schemas/pokemon'
import type { natureSchema } from '~/schemas/stats'

export type ChampionsAbility = z.infer<typeof championsAbilitiesSchema>
export type ChampionsItem = z.infer<typeof championsItemsSchema>
export type ChampionsMove = z.infer<typeof championsMovesSchema>
export type ChampionsSpecies = z.infer<typeof championsSpeciesNameSchema>
export type Nature = z.infer<typeof natureSchema>
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
  | 'Aerodactyl'
  | 'Aggron'
  | 'Alakazam'
  | 'Arcanine'
  | 'Arcanine-Hisui'
  | 'Archaludon'
  | 'Avalugg-Hisui'
  | 'Basculegion'
  | 'Basculegion-F'
  | 'Blastoise'
  | 'Charizard'
  | 'Clefable'
  | 'Conkeldurr'
  | 'Corviknight'
  | 'Crabominable'
  | 'Decidueye-Hisui'
  | 'Dragapult'
  | 'Dragonite'
  | 'Excadrill'
  | 'Farigiraf'
  | 'Feraligatr'
  | 'Froslass'
  | 'Garchomp'
  | 'Gardevoir'
  | 'Garganacl'
  | 'Glimmora'
  | 'Goodra-Hisui'
  | 'Greninja'
  | 'Gyarados'
  | 'Hatterene'
  | 'Heracross'
  | 'Hippowdon'
  | 'Incineroar'
  | 'Kangaskhan'
  | 'Kingambit'
  | 'Kommo-o'
  | 'Krookodile'
  | 'Lopunny'
  | 'Luxray'
  | 'Machamp'
  | 'Mamoswine'
  | 'Maushold'
  | 'Mr. Rime'
  | 'Ninetales'
  | 'Ninetales-Alola'
  | 'Orthworm'
  | 'Palafin'
  | 'Pelipper'
  | 'Politoed'
  | 'Raichu-Alola'
  | 'Rotom-Fan'
  | 'Rotom-Frost'
  | 'Rotom-Heat'
  | 'Rotom-Mow'
  | 'Rotom-Wash'
  | 'Sableye'
  | 'Samurott-Hisui'
  | 'Scovillain'
  | 'Sharpedo'
  | 'Simipour'
  | 'Simisage'
  | 'Simisear'
  | 'Sinistcha'
  | 'Skarmory'
  | 'Skeledirge'
  | 'Slowbro'
  | 'Slowbro-Galar'
  | 'Slowking-Galar'
  | 'Snorlax'
  | 'Stunfisk-Galar'
  | 'Sylveon'
  | 'Talonflame'
  | 'Tauros-Paldea-Aqua'
  | 'Tauros-Paldea-Blaze'
  | 'Tauros-Paldea-Combat'
  | 'Tinkaton'
  | 'Torkoal'
  | 'Toxapex'
  | 'Tsareena'
  | 'Typhlosion-Hisui'
  | 'Tyranitar'
  | 'Vanilluxe'
  | 'Venusaur'
  | 'Vivillon'
  | 'Volcarona'
  | 'Watchog'
  | 'Whimsicott'
  | 'Wyrdeer'
  | 'Zoroark'
  | 'Zoroark-Hisui'

