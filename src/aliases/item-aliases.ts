import { currentRegulation } from '~/constants/champions/regulation'
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
  'Poison Barb': ['PBarb'],
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

// Every Champions-legal "<Name> Berry" gets its bare lowercase shorthand for
// free ("Chople Berry" → "chople", "Lum Berry" → "lum"). Derived from the
// current regulation's legal items rather than the full upstream item
// snapshot — the snapshot includes legacy/contest-only berries (Gold, Bluk,
// Kee, Kelpsy, Pamtre, …) flagged isNonstandard:'Past' in @pkmn/mods/champions,
// whose auto-derived aliases were dead in practice and collided with legitimate
// species shorthands (e.g. Gold Berry → 'gold' shadowed Gholdengo → 'Gold').
// The generic bare "Berry" item is not in legalItems, so it's filtered out
// implicitly by the source list.
const berryAliases = Object.fromEntries(
  currentRegulation.legalItems
    .filter((name) => name.endsWith(' Berry'))
    .map((name) => [name, [name.slice(0, -' Berry'.length).toLowerCase()]]),
) as Partial<Record<AllItemName, readonly string[]>>

export const itemAliases: Partial<Record<AllItemName, readonly string[]>> = {
  ...berryAliases,
  ...curatedItemAliases,
}
