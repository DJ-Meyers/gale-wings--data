// Manually curated snapshot of VGC 2026 Regulation Set M-B. Pokemon
// Champions formats are additive (each new regulation strictly extends the
// previous one), so M-B inherits from M-A and only lists the net additions
// below. To add a new species or item to M-B, append it to
// `m_b_additions.species` or `m_b_additions.items` (keeping the list sorted);
// the final `legalSpecies` / `legalItems` arrays are derived at module load.
//
// Stat/type/ability data for the M-B Champions Megas ships natively from
// `@pkmn/mods/champions` (0.10.10+). Their stones (Raichunite X/Y, Staraptite,
// Scolipite, Scraftinite, Pyroarite, Malamarite, Barbaracite, Dragalgite,
// Falinksite) are in `m_b_additions.items` below.

import type { Regulation } from '~/types/champions/regulation'
import {
  vgc2026_MA,
  type Vgc2026_MAItem,
  type Vgc2026_MASpecies,
} from './vgc-2026-m-a'
import { vgc2026_MBDefaults } from './vgc-2026-m-b-defaults'

// Net additions over M-A. Exported (rather than module-local) so tests can
// assert the source-of-truth list itself is sorted; the derived
// `legalSpecies` / `legalItems` arrays below are always sorted at runtime.
export const m_b_additions = {
  species: [
    'Annihilape',
    'Barbaracle',
    'Barbaracle-Mega',
    'Blaziken',
    'Blaziken-Mega',
    'Dragalge',
    'Dragalge-Mega',
    'Eelektross',
    'Falinks',
    'Falinks-Mega',
    'Gholdengo',
    'Grimmsnarl',
    'Houndstone',
    'Malamar',
    'Malamar-Mega',
    'Mawile',
    'Mawile-Mega',
    'Metagross',
    'Metagross-Mega',
    'Overqwil',
    'Pyroar',
    'Pyroar-Mega',
    'Raichu-Mega-X',
    'Raichu-Mega-Y',
    'Sceptile',
    'Sceptile-Mega',
    'Scolipede',
    'Scolipede-Mega',
    'Scrafty',
    'Scrafty-Mega',
    'Staraptor',
    'Staraptor-Mega',
    'Swampert',
    'Swampert-Mega',
  ],
  items: [
    'Barbaracite',
    'Big Root',
    'Blazikenite',
    'Damp Rock',
    'Dragalgite',
    'Expert Belt',
    'Falinksite',
    'Heat Rock',
    'Icy Rock',
    'Iron Ball',
    'Life Orb',
    'Light Clay',
    'Malamarite',
    'Mawilite',
    'Metagrossite',
    'Metronome',
    'Muscle Band',
    'Pyroarite',
    'Raichunite X',
    'Raichunite Y',
    'Sceptilite',
    'Scolipite',
    'Scraftinite',
    'Shed Shell',
    'Smooth Rock',
    'Staraptite',
    'Swampertite',
    'Wide Lens',
    'Wise Glasses',
    'Zoom Lens',
  ],
} as const

export type Vgc2026_MBSpecies =
  | Vgc2026_MASpecies
  | (typeof m_b_additions.species)[number]
export type Vgc2026_MBItem =
  | Vgc2026_MAItem
  | (typeof m_b_additions.items)[number]

const legalSpecies: readonly Vgc2026_MBSpecies[] = [
  ...vgc2026_MA.legalSpecies,
  ...m_b_additions.species,
].toSorted()

const legalItems: readonly Vgc2026_MBItem[] = [
  ...vgc2026_MA.legalItems,
  ...m_b_additions.items,
].toSorted()

export const vgc2026_MB = {
  id: 'vgc2026_MB',
  name: 'VGC 2026 Regulation Set M-B',
  legalSpecies,
  legalItems,
  legalMechanics: ['mega-evolution'] as const,
  speciesDefaults: vgc2026_MBDefaults,
} as const satisfies Regulation
