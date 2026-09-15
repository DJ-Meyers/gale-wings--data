// Form-prefill defaults for VGC 2026 Regulation Set M-C. M-B's entries carry
// over verbatim via the spread (M-C is a superset); the new rows below come
// from the M-C defaults CSV.
//
// Megas omit `ability` because the forme has a single forced ability — the
// dex layer falls back to `species.abilities[0]` in that case.

import type { SpeciesDefault } from '~/types/champions/regulation'
import { vgc2026_MBDefaults } from './vgc-2026-m-b-defaults'
import type { Vgc2026_MCSpecies } from './vgc-2026-m-c'

export const vgc2026_MCDefaults = {
  ...vgc2026_MBDefaults,
  'Absol-Mega-Z': { nature: 'Adamant', move: 'Night Slash' },
  Baxcalibur: { nature: 'Adamant', move: 'Glaive Rush', ability: 'Thermal Exchange' },
  'Baxcalibur-Mega': { nature: 'Adamant', move: 'Glaive Rush' },
  Cinderace: { nature: 'Jolly', move: 'Pyro Ball', ability: 'Libero' },
  'Garchomp-Mega-Z': { nature: 'Modest', move: 'Draco Meteor' },
  Golisopod: { nature: 'Adamant', move: 'Liquidation' },
  'Golisopod-Mega': { nature: 'Adamant', move: 'Leech Life' },
  Grapploct: { nature: 'Adamant', move: 'Storm Throw', ability: 'Technician' },
  Indeedee: { nature: 'Modest', move: 'Expanding Force', ability: 'Psychic Surge' },
  'Indeedee-F': { nature: 'Modest', move: 'Terrain Pulse', ability: 'Psychic Surge' },
  Inteleon: { nature: 'Timid', move: 'Snipe Shot', ability: 'Sniper' },
  'Lucario-Mega-Z': { nature: 'Modest', move: 'Aura Sphere' },
  Pawmot: { nature: 'Jolly', move: 'Double Shock', ability: 'Iron Fist' },
  Pincurchin: { nature: 'Modest', move: 'Rising Voltage', ability: 'Electric Surge' },
  Rillaboom: { nature: 'Adamant', move: 'Grassy Glide', ability: 'Grassy Surge' },
  'Salamence-Mega': { nature: 'Modest', move: 'Hyper Voice' },
  'Sirfetch’d': { nature: 'Adamant', move: 'Meteor Assault', ability: 'Scrappy' },
  'Toxtricity-Low-Key': { nature: 'Modest', move: 'Overdrive', ability: 'Punk Rock' },
  Wigglytuff: { nature: 'Modest', move: 'Moonblast', ability: 'Competitive' },
} as const satisfies Partial<Record<Vgc2026_MCSpecies, SpeciesDefault>>
