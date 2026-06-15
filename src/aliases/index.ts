import { toID } from '@smogon/calc'
import { fieldConditionAliases } from './field-condition-aliases'
import { itemAliases } from './item-aliases'
import { moveAliases } from './move-aliases'
import { speciesAliases } from './species-aliases'

// Builds a `toID(alias) → canonical` Map from one of the *-aliases data
// modules. Canonical narrows to the data's literal keys, so adding a row
// extends the target union for free.
const buildAliasMap = <T extends string>(
  data: Partial<Record<T, readonly string[]>>,
): Map<string, T> =>
  new Map(
    (Object.entries(data) as [string, readonly string[]][]).flatMap(([canonical, aliases]) =>
      aliases.map((alias) => [toID(alias), canonical as T] as const),
    ),
  )

export const ITEM_ALIASES = buildAliasMap(itemAliases)
export const SPECIES_ALIASES = buildAliasMap(speciesAliases)
export const MOVE_ALIASES = buildAliasMap(moveAliases)
export const FIELD_CONDITION_ALIASES = buildAliasMap(fieldConditionAliases)

export type ItemAliasTarget = keyof typeof itemAliases
export type SpeciesAliasTarget = keyof typeof speciesAliases
export type MoveAliasTarget = keyof typeof moveAliases
export type FieldConditionAliasTarget = keyof typeof fieldConditionAliases

// Raw canonical → aliases (for clients doing autocomplete / display).
export { itemAliases, speciesAliases, moveAliases, fieldConditionAliases }
