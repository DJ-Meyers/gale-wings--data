// Bootstrap a manual regulation file from the current @pkmn/mods/champions dex.
// Usage: pnpm tsx packages/shared-types/scripts/snapshot-regulation.ts
//
// Prints the species and item literal arrays to stdout — paste into a new
// `constants/champions/regulation/<id>.ts` when the next regulation drops (or
// to regenerate the current one). Cosmetic formes are filtered out at
// snapshot time so consumers never have to re-filter.

import { Dex, type ID, type ModData } from '@pkmn/dex'
import * as champions from '@pkmn/mods/champions'

const dex = Dex.mod('champions' as ID, champions as ModData)
await dex.learnsets.get('venusaur')

const species = dex.species
  .all()
  .filter((s) => s.isNonstandard == null && !s.isCosmeticForme)
  .map((s) => s.name)
  .toSorted()

const items = dex.items
  .all()
  .filter((i) => i.isNonstandard == null)
  .map((i) => i.name)
  .toSorted()

const printArray = (label: string, values: readonly string[]): string => {
  const lines = values.map((v) => `    ${JSON.stringify(v)},`).join('\n')
  return `  ${label}: [\n${lines}\n  ] as const,`
}

process.stdout.write(
  [
    `// Snapshot of @pkmn/mods/champions at ${new Date().toISOString().slice(0, 10)}.`,
    `// Counts: ${species.length} species, ${items.length} items.`,
    '',
    'export const snapshot = {',
    printArray('legalSpecies', species),
    printArray('legalItems', items),
    `  legalMechanics: ['mega-evolution'] as const,`,
    '} as const',
    '',
  ].join('\n'),
)
