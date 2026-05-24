import type {
  ChampionsItem,
  ChampionsMove,
  ChampionsSpecies,
  ParseableAbility,
  StatAlignment,
  Status,
  TeraType,
} from './champions'
import type { FieldConditions } from './field-conditions'
import type { StatBoosts, StatPoints } from './stats'

/** The pokemon-shaped fields a parser pass produces. Always populated; may be partial. */
export interface ParsedPokemon {
  species?: ChampionsSpecies
  move?: ChampionsMove
  statAlignment?: StatAlignment
  ability?: ParseableAbility
  item?: ChampionsItem
  statPoints?: Partial<StatPoints>
  level?: number
  teraType?: TeraType
  statBoosts?: Partial<StatBoosts>
  status?: Status
  isCrit?: boolean
  abilityOn?: boolean
  boostedStat?: string
  fieldConditions?: FieldConditions
}

export interface ParseSchemaError {
  path: string
  message: string
}

/**
 * Full result of a single parse pass.
 * - `pokemon`: the parsed entity fields (always present; may be partial)
 * - `errors`: schema-validation issues (empty when parse is Champions-legal,
 *   or when essential fields like species/ability are still missing)
 * - `unmatched`: input tokens the parser didn't recognize
 */
export interface ParseInputResult {
  pokemon: ParsedPokemon
  errors: ParseSchemaError[]
  unmatched: string[]
}

