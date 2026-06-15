import { allItemNames } from '~/constants/all-items'
import type { AllItemName } from '~/types/champions/regulation'

// Hand-curated aliases for non-berry items. Berries are derived below.
const curatedItemAliases = {
  'Assault Vest': ['vest', 'av'],
  'Black Glasses': ['glasses'],
  Charcoal: ['charc'],
  'Choice Band': ['band'],
  'Choice Scarf': ['scarf'],
  'Choice Specs': ['specs'],
  'Dragon Fang': ['fang'],
  'Fairy Feather': ['feather', 'FF'],
  'Focus Sash': ['sash'],
  'Hard Stone': ['stone'],
  'Heavy-Duty Boots': ['boots', 'hdb'],
  Leftovers: ['lefties'],
  'Life Orb': ['orb', 'lo', 'plate'],
  'Light Ball': ['LB'],
  'Metal Coat': ['MC'],
  'Miracle Seed': ['MS'],
  'Mystic Water': ['MW'],
  'Never-Melt Ice': ['NMI'],
  'Poison Barb': ['barb'],
  'Sharp Beak': ['beak'],
  'Silk Scarf': ['silk'],
  'Silver Powder': ['powder'],
  'Twisted Spoon': ['spoon'],
} as const satisfies Partial<Record<AllItemName, readonly string[]>>

// Every "<Name> Berry" item gets its bare lowercase shorthand for free
// ("Chople Berry" → "chople", "Lum Berry" → "lum"), derived from the item
// snapshot so any berry added upstream picks up an alias automatically. The
// generic "Berry" item is skipped (its shorthand would be empty).
const berryAliases = Object.fromEntries(
  allItemNames
    .filter((name) => name.endsWith(' Berry') && name !== 'Berry')
    .map((name) => [name, [name.slice(0, -' Berry'.length).toLowerCase()]]),
) as Partial<Record<AllItemName, readonly string[]>>

export const itemAliases: Partial<Record<AllItemName, readonly string[]>> = {
  ...berryAliases,
  ...curatedItemAliases,
}
