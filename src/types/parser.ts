import type {
  ChampionsItem,
  ChampionsMove,
  ChampionsSpecies,
  Nature,
  ParseableAbility,
  Status,
  TeraType,
} from './champions'
import type { FieldConditions } from './field-conditions'
import type { Boosts, StatPoints } from './stats'

/** The pokemon-shaped fields a parser pass produces. Always populated; may be partial. */
export interface ParsedPokemon {
  species?: ChampionsSpecies
  move?: ChampionsMove
  nature?: Nature
  ability?: ParseableAbility
  item?: ChampionsItem
  statPoints?: Partial<StatPoints>
  level?: number
  teraType?: TeraType
  boosts?: Partial<Boosts>
  status?: Status
  isCrit?: boolean
  abilityOn?: boolean
  boostedStat?: string
  /** Explicit move base-power override, e.g. from a `150BP` token. Integer, 1..999. */
  basePowerOverride?: number
  /** Fallen-ally count for Supreme Overlord-style scaling, e.g. from a `Supreme Overlord 3` / `3 fainted` token. Integer, 0..5. */
  alliesFainted?: number
  /** Multi-hit count override, e.g. from a `5 hits` token. Integer. Valid range is
   *  the move's own multihit range (e.g. Icicle Spear 2–5), enforced parser-side.
   *  Maps to @smogon/calc `Move({ hits })`. */
  hits?: number
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
