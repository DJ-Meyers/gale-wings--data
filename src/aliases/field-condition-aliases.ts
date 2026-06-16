import type { FieldConditionAliasName } from '~/types/field-conditions'

/**
 * Display-name → short-alias mapping for field conditions a parser/calc
 * consumer might shorthand. Same shape as `moveAliases` / `itemAliases` /
 * `speciesAliases` so the build helper in `./index.ts` produces a
 * `toID(alias) → canonical` lookup map the same way.
 *
 * Aliases normalize via `toID` (lowercase + alphanumeric only), so `Veil`,
 * `veil`, `VEIL` all resolve to `'Aurora Veil'`; `FAura` and `F-Aura` both
 * resolve to `'Fairy Aura'`.
 */
export const fieldConditionAliases = {
  'Aurora Veil': ['Veil', 'AVeil'],
  'Light Screen': ['Screen', 'LS'],
  Reflect: ['Ref', 'Refl'],
  Tailwind: ['TW'],
  'Helping Hand': ['HH'],
  'Fairy Aura': ['FAura', 'F-Aura'],
  'Dark Aura': ['DAura', 'D-Aura'],
  'Psychic Terrain': ['PTerrain', 'PsychicT', 'PTerr'],
  'Electric Terrain': ['ETerrain', 'ElectricT', 'ETerr'],
  'Grassy Terrain': ['GTerrain', 'GrassyT', 'GTerr'],
  'Misty Terrain': ['MTerrain', 'MistyT', 'MTerr'],
} as const satisfies Partial<Record<FieldConditionAliasName, readonly string[]>>
