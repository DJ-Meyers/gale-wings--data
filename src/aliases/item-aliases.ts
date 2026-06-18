import { allItemNames } from '~/constants/all-items'
import type { AllItemName } from '~/types/champions/regulation'

// Hand-curated aliases for non-berry items. Berries are derived below.
const curatedItemAliases = {
  'Assault Vest': ['vest', 'av'],
  'Big Root': ['Root', 'BRoot'],
  'Black Glasses': ['glasses'],
  Charcoal: ['charc'],
  'Choice Band': ['band'],
  'Choice Scarf': ['scarf'],
  'Choice Specs': ['specs'],
  'Damp Rock': ['DRock'],
  'Dragon Fang': ['fang'],
  'Expert Belt': ['Expert', 'EBelt'],
  'Fairy Feather': ['feather', 'FF'],
  'Focus Sash': ['sash'],
  'Hard Stone': ['stone'],
  'Heat Rock': ['HRock'],
  'Heavy-Duty Boots': ['boots', 'hdb'],
  'Icy Rock': ['IRock'],
  'Iron Ball': ['IBall'],
  Leftovers: ['lefties'],
  'Life Orb': ['orb', 'lo', 'plate'],
  'Light Ball': ['LB'],
  'Light Clay': ['Clay', 'LClay'],
  'Metal Coat': ['MC'],
  Metronome: ['Nome'],
  'Miracle Seed': ['MS'],
  'Muscle Band': ['MBand'],
  'Mystic Water': ['MW'],
  'Never-Melt Ice': ['NMI'],
  'Poison Barb': ['barb'],
  'Shed Shell': ['SShell'],
  'Sharp Beak': ['beak'],
  'Silk Scarf': ['silk'],
  'Silver Powder': ['powder'],
  'Smooth Rock': ['SRock', 'Smooth'],
  'Twisted Spoon': ['spoon'],
  'Wide Lens': ['WLens'],
  'Wise Glasses': ['WGlasses'],
  'Zoom Lens': ['ZLens', 'Zoom'],
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
