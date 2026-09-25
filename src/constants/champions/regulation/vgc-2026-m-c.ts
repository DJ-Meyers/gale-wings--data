// Manually curated snapshot of VGC 2026 Regulation Set M-C. Pokemon
// Champions formats are additive (each new regulation strictly extends the
// previous one), so M-C inherits from M-B and only lists the net additions
// below. To add a new species or item to M-C, append it to
// `m_c_additions.species` or `m_c_additions.items` (keeping the list sorted);
// the final `legalSpecies` / `legalItems` arrays are derived at module load.
//
// The delta is derived from smogon/pokemon-showdown commit 812501ed ("Add
// Champions Regulation M-C") cross-checked against the master SHA pinned in
// `../showdown-patch/meta.json` (the generated delta that brings the
// installed @pkmn/mods data up to date; see scripts/build-showdown-patch.ts).
// Notable exclusions confirmed there: Farfetch'd-Galar and Mr. Mime-Galar
// stay isNonstandard:'Past' upstream and are NOT legal, despite early web
// reports. Stat/type data for the six new Megas ships from @pkmn/dex, with
// ability corrections in the patch's Species overlay.

import type { Regulation } from '~/types/champions/regulation'
import {
  vgc2026_MB,
  type Vgc2026_MBItem,
  type Vgc2026_MBSpecies,
} from './vgc-2026-m-b'
import { vgc2026_MCDefaults } from './vgc-2026-m-c-defaults'

// Net additions over M-B. Exported (rather than module-local) so tests can
// assert the source-of-truth list itself is sorted; the derived
// `legalSpecies` / `legalItems` arrays below are always sorted at runtime.
export const m_c_additions = {
  species: [
    'Absol-Mega-Z',
    'Arboliva',
    'Baxcalibur',
    'Baxcalibur-Mega',
    'Cinderace',
    'Farfetch’d',
    'Garchomp-Mega-Z',
    'Gogoat',
    'Golisopod',
    'Golisopod-Mega',
    'Grapploct',
    'Indeedee',
    'Indeedee-F',
    'Inteleon',
    'Lucario-Mega-Z',
    'Mabosstiff',
    'Mr. Mime',
    'Pawmot',
    'Perrserker',
    'Persian',
    'Persian-Alola',
    'Pincurchin',
    'Rillaboom',
    'Salamence',
    'Salamence-Mega',
    'Sirfetch’d',
    'Squawkabilly',
    'Squawkabilly-Blue',
    'Squawkabilly-White',
    'Squawkabilly-Yellow',
    'Swalot',
    'Thievul',
    'Toxtricity',
    'Toxtricity-Low-Key',
    'Wigglytuff',
  ],
  items: [
    'Absolite Z',
    'Air Balloon',
    'Baxcalibrite',
    'Binding Band',
    'Eject Button',
    'Electric Seed',
    'Garchompite Z',
    'Golisopite',
    'Grassy Seed',
    'Leek',
    'Lucarionite Z',
    'Misty Seed',
    'Normal Gem',
    'Psychic Seed',
    'Red Card',
    'Rocky Helmet',
    'Salamencite',
    'Terrain Extender',
  ],
} as const

export type Vgc2026_MCSpecies =
  | Vgc2026_MBSpecies
  | (typeof m_c_additions.species)[number]
export type Vgc2026_MCItem =
  | Vgc2026_MBItem
  | (typeof m_c_additions.items)[number]

const legalSpecies: readonly Vgc2026_MCSpecies[] = [
  ...vgc2026_MB.legalSpecies,
  ...m_c_additions.species,
].toSorted()

const legalItems: readonly Vgc2026_MCItem[] = [
  ...vgc2026_MB.legalItems,
  ...m_c_additions.items,
].toSorted()

export const vgc2026_MC = {
  id: 'vgc2026_MC',
  name: 'VGC 2026 Regulation Set M-C',
  legalSpecies,
  legalItems,
  legalMechanics: ['mega-evolution'] as const,
  speciesDefaults: vgc2026_MCDefaults,
} as const satisfies Regulation
