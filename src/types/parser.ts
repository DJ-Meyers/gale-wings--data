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
  /** Current HP as a percentage of max (0–100). Sourced from a "165/177"
   *  fraction or an "85%" token. Populated in both forms so HP-scaling moves
   *  (Eruption, Water Spout, Reversal/Flail) can read a single field; when
   *  only `hpPercent` is set (the % form), the client converts to a raw curHP
   *  using its locally computed max HP. */
  hpPercent?: number
  /** Raw current HP — populated only when the user typed the fraction form
   *  ("165/177"). Lets the client hand `curHP` to @smogon/calc verbatim,
   *  avoiding the percent→raw rounding that the `%` form requires. */
  currentHp?: number
  /** Raw max HP — populated only with the fraction form. Lets the client
   *  cross-check against its own computed max HP for the spread. */
  maxHp?: number
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
