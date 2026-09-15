// Champions Mega species whose installed @pkmn/dex (0.10.11, 2026-06-18)
// entries have drifted from Showdown master `data/pokedex.ts` at the pinned
// vendored-data SHA (src/vendor/champions/meta.json). The June release
// shipped pre-release Legends Z-A data for the Z-Megas; Champions corrected
// their abilities on release. Each entry uses `inherit: true` so only the
// fields listed here override — stats, types, weights, and forme metadata
// verified identical upstream and inherited from @pkmn/dex unchanged.
//
// Salamence-Mega (official Gen 6 data) was diffed too: identical, no patch.

import type { ModData } from '@pkmn/dex'

export const championsMegaSpeciesPatch: NonNullable<ModData['Species']> = {
  // Installed: Magic Bounce (stale Z-A). Master: Sharpness.
  absolmegaz: {
    inherit: true,
    abilities: { 0: 'Sharpness' },
  },
  // Installed: {0: Thermal Exchange, H: Ice Body} (base-species table copied
  // onto the forme). Master: forced single ability Thermal Exchange — the
  // single-ability shape also lets the defaults layer prefill it.
  baxcaliburmega: {
    inherit: true,
    abilities: { 0: 'Thermal Exchange' },
  },
  // Installed: Sand Force (stale Z-A). Master: Levitate.
  garchompmegaz: {
    inherit: true,
    abilities: { 0: 'Levitate' },
  },
  // Installed: Emergency Exit (stale Z-A). Master: Tough Claws.
  golisopodmega: {
    inherit: true,
    abilities: { 0: 'Tough Claws' },
  },
  // Master: Aura Guard (halves damage taken from contact moves). Not in
  // @smogon/calc yet; stand in with Inner Focus (no damage-calc effect —
  // calcs will overestimate contact damage taken by Lucario-Mega-Z) until
  // the calc catches up, then flip this back. Installed dex has stale Z-A
  // Adaptability, which would inflate its own STAB numbers instead.
  lucariomegaz: {
    inherit: true,
    abilities: { 0: 'Inner Focus' },
  },
}
