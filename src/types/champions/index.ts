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

