// Delta between the installed @pkmn/mods/champions (+ @pkmn/dex) data and
// smogon/pokemon-showdown at the commit pinned in meta.json. dex.ts is the
// only consumer.
//
// Why a delta: @pkmn/mods lags Showdown master by months, and the Champions
// mod moves fast (a regulation flips move/item/species legality and rewrites
// learnsets). Vendoring the full tables would mean tens of thousands of lines
// redeclaring every species and item; the delta is a few hundred lines and
// shrinks by itself as npm catches up.
//
// Two halves, because @pkmn/dex's Dex.mod merges `inherit` entries shallowly
// (top-level keys only):
//   - Abilities / FormatsData / Items / Moves / Species: entries in Dex.mod
//     shape, spread over the installed mod tables at key level. Un-flags are
//     `isNonstandard: null` (a `null` ENTRY would mean deletion to Dex.mod).
//   - Learnsets: per-species `add` / `remove` move-id lists relative to what
//     the installed data yields after move-legality filtering, applied after
//     the table primes (applyLearnsetPatch below).
//
// Regenerating (one-off, when @pkmn/mods or @pkmn/dex bumps, or to move the
// Showdown pin): the generator is NOT committed — it is a one-time tool kept
// in the maintainer's checkout at scripts/build-showdown-patch.ts (gitignored).
// It fetches the five Champions mod tables + data/pokedex.ts at the pinned
// SHA via ./upstream.ts, diffs them against the installed packages, and
// rewrites this directory (`SHOWDOWN_SHA=<sha>` bumps the pin). Without it,
// hand-edit the tables and let showdown-patch.test.ts (network parity) judge.

import type { LearnsetData, ModData } from '@pkmn/dex'

import { Abilities } from './abilities'
import { FormatsData } from './formats-data'
import { Items } from './items'
import { Learnsets, type LearnsetPatch } from './learnsets'
import meta from './meta.json'
import { Moves } from './moves'
import { Species } from './species'

// Tables in Dex.mod shape: spread over the installed mod's tables at key level
// (an entry here replaces the installed entry for that id wholesale).
export const showdownPatch: {
  readonly Abilities: NonNullable<ModData['Abilities']>
  readonly FormatsData: NonNullable<ModData['FormatsData']>
  readonly Items: NonNullable<ModData['Items']>
  readonly Moves: NonNullable<ModData['Moves']>
  readonly Species: NonNullable<ModData['Species']>
} = { Abilities, FormatsData, Items, Moves, Species }

export const learnsetPatch: Readonly<Record<string, LearnsetPatch>> = Learnsets
export type { LearnsetPatch }

export const showdownPatchMeta = meta

// Apply the learnset half after the dex has primed its Learnsets table.
// Dex.mod merges `inherit` entries shallowly, so a learnset override would
// have to be a full learnset — hence per-species deltas applied here instead.
// Entries the mod does not override are shared references with the Gen 9
// dex's table, so every touched species gets a fresh object (copy-on-write)
// rather than an in-place mutation.
export const applyLearnsetPatch = (
  table: Record<string, LearnsetData>,
  patch: Readonly<Record<string, LearnsetPatch>>,
): void => {
  for (const [id, { add, remove }] of Object.entries(patch)) {
    const entry = table[id] ?? {}
    const learnset = { ...(entry.learnset ?? {}) }
    for (const move of remove) delete learnset[move]
    for (const move of add) learnset[move] = ['9M']
    table[id] = { ...entry, learnset }
  }
}
