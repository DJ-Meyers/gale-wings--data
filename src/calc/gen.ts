import { Generations, toID } from '@smogon/calc'
import type { ID, Item, Specie } from '@smogon/calc/dist/data/interface'

import { getItem, getSpecies } from '../dex.js'

export const gen = Generations.get(9)

// @smogon/calc's gen789 base-power code reads `gen.items.get(defender.item).megaEvolves`
// without a null guard, so any defender holding a Champions-only mega stone
// (Floettite, Drampanite, ...) crashes the calc for every move. Wrap the
// lookup so unknown items resolve to a synthetic Item sourced from the
// gale-wings champions dex.
//
// megaEvolves carries the substring @smogon/calc expects defender.name to
// include for the Knock Off resistance check (e.g. 'Charizard' for
// 'Charizard-Mega-Y'). For Champions megas the holder is the base species
// itself ('Floette-Eternal', 'Clefable', ...), so the first dash-separated
// token of the holder name reliably matches the '-Mega' defender.
const originalItemsGet = gen.items.get.bind(gen.items)
gen.items.get = (id: ID): Item | undefined => {
  const hit = originalItemsGet(id)
  if (hit) return hit
  const dexItem = getItem(id)
  if (!dexItem.exists) return undefined
  const holder = dexItem.megaStone
    ? Object.keys(dexItem.megaStone)[0]
    : undefined
  return {
    kind: 'Item',
    id: toID(dexItem.name) as ID,
    name: dexItem.name,
    megaEvolves: holder?.split('-')[0],
  } as Item
}

// Display-name aliases the client uses for compactness.
// Maps client display name → @smogon/calc canonical species name.
const DISPLAY_NAME_TO_SMOGON: Record<string, string> = {
  'Basculin-Blue': 'Basculin-Blue-Striped',
  'Basculin-White': 'Basculin-White-Striped',
  'Urshifu-Rapid': 'Urshifu-Rapid-Strike',
  'Urshifu-Single': 'Urshifu',
}

const SMOGON_TO_DISPLAY: Record<string, string> = Object.fromEntries(
  Object.entries(DISPLAY_NAME_TO_SMOGON)
    .filter(([display, smogon]) => display !== smogon)
    .map(([display, smogon]) => [smogon, display]),
)

export const toSmogonName = (displayName: string): string =>
  DISPLAY_NAME_TO_SMOGON[displayName] ?? displayName

export const toDisplayName = (smogonName: string): string =>
  SMOGON_TO_DISPLAY[smogonName] ?? smogonName

// @smogon/calc's bundled gen9 data is missing Champions-mod megas
// (Floette-Mega, Drampa-Mega, ...). When the calc lookup misses, fall
// back to the gale-wings champions dex and return the seven fields the
// Pokemon constructor actually reads as `overrides`.
export const speciesOverride = (name: string): Partial<Specie> | undefined => {
  if (gen.species.get(toID(name))) return undefined
  const s = getSpecies(name)
  if (!s.exists) return undefined
  return {
    name: s.name,
    types: s.types,
    baseStats: s.baseStats,
    weightkg: s.weightkg,
    abilities: s.abilities,
    baseSpecies: s.baseSpecies,
    otherFormes: s.otherFormes,
  } as Partial<Specie>
}

// True when the species resolves in either data layer — used as the
// "do we know this Pokemon?" guard before calc construction.
export const hasSpecies = (name: string): boolean =>
  !!gen.species.get(toID(name)) || getSpecies(name).exists
