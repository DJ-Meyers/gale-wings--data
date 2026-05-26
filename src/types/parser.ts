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

export type ParseError =
  | { kind: 'schema'; path: string; message: string }
  | { kind: 'unmatched'; token: string }

/**
 * Full result of a single parse pass.
 * - `pokemon`: the parsed entity fields (always present; may be partial)
 * - `errors`: combined list of schema-validation issues and unrecognized tokens,
 *   tagged via the `kind` discriminator
 */
export interface ParseInputResult {
  pokemon: ParsedPokemon
  errors: ParseError[]
}

