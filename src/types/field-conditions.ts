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

/**
 * Display-name union for terrains. These are "<Type> Terrain" rather than the
 * bare `FieldConditions['terrain']` values (`Psychic`, `Electric`, …) so the
 * alias map's canonical column stays unambiguous and self-describing — a key
 * of `Psychic` would collide visually with the type, status, and move-category
 * meanings of that word.
 */
export type TerrainName =
  | 'Electric Terrain'
  | 'Grassy Terrain'
  | 'Misty Terrain'
  | 'Psychic Terrain'

/** Canonical-name constraint for the `fieldConditionAliases` map. */
export type FieldConditionAliasName =
  | SideConditionName
  | FieldWideConditionName
  | TerrainName
