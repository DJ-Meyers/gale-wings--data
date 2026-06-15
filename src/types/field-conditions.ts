import type { z } from 'zod'
import type { fieldConditionsSchema } from '~/schemas/field-conditions'

export type FieldConditions = z.infer<typeof fieldConditionsSchema>

/**
 * Display-name union for per-side field conditions (one player's half of the
 * field). Matches the canonical names the parser's side-condition dispatch
 * tables already recognize.
 */
export type SideConditionName =
  | 'Aurora Veil'
  | 'Friend Guard'
  | 'Helping Hand'
  | 'Light Screen'
  | 'Reflect'
  | 'Tailwind'

/**
 * Display-name union for field-wide conditions that affect both sides. Groups
 * structural field effects (Gravity) and damage-affecting auras (Fairy Aura,
 * Dark Aura) together — the auras are abilities mechanically, but from a
 * parser/UI standpoint they're "set once on the field" the same as Gravity.
 */
export type FieldWideConditionName = 'Gravity' | 'Fairy Aura' | 'Dark Aura'

/** Canonical-name constraint for the `fieldConditionAliases` map. */
export type FieldConditionAliasName = SideConditionName | FieldWideConditionName
