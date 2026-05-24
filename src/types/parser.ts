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

export interface ParseResult {
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
  unmatched: string[]
}
