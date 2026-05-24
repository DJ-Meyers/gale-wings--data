import type { FieldConditions } from './field-conditions'
import type { StatBoosts, StatPoints } from './stats'

export interface ParseResult {
  species?: string
  move?: string
  statAlignment?: string
  ability?: string
  item?: string
  statPoints?: Partial<StatPoints>
  level?: number
  teraType?: string
  statBoosts?: Partial<StatBoosts>
  status?: string
  isCrit?: boolean
  abilityOn?: boolean
  boostedStat?: string
  fieldConditions?: FieldConditions
  unmatched: string[]
}
