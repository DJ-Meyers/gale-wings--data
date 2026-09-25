// GENERATED — do not edit by hand. See index.ts for how to regenerate.
// Delta of smogon/pokemon-showdown@a5df8274 (data/mods/champions/moves.ts)
// over @pkmn/mods@0.10.11 + @pkmn/dex@0.10.11. Provenance in meta.json.
import type { ModData } from '@pkmn/dex'

export const Moves: NonNullable<ModData['Moves']> = {
  curse: { inherit: true, tracksTarget: true },
  disable: { inherit: true, condition: { inherit: true } },
  doubleshock: { inherit: true, flags: { contact: 1, protect: 1, mirror: 1, punch: 1 } }, // was { inherit: true, isNonstandard: 'Custom' }
  meteorassault: { inherit: true, basePower: 170, isNonstandard: null },
  milkdrink: { inherit: true, target: 'adjacentAllyOrSelf' }, // was { inherit: true, isNonstandard: 'Past' }
  octolock: { inherit: true, isNonstandard: null },
  slash: { inherit: true, basePower: 80 }, // was { inherit: true, isNonstandard: 'Past' }
  snipeshot: { inherit: true, basePower: 85 }, // was { inherit: true, basePower: 85, isNonstandard: 'Past' }
  strengthsap: { inherit: true, pp: 5 },
  wish: { inherit: true, pp: 5 },
  courtchange: { inherit: true, isNonstandard: null }, // was { inherit: true, isNonstandard: 'Past' }
  drumbeating: { inherit: true, isNonstandard: null }, // was { inherit: true, isNonstandard: 'Past' }
  glaiverush: { inherit: true, isNonstandard: null }, // was { inherit: true, isNonstandard: 'Past' }
  jawlock: { inherit: true, isNonstandard: null }, // was { inherit: true, isNonstandard: 'Past' }
  overdrive: { inherit: true, isNonstandard: null }, // was { inherit: true, isNonstandard: 'Past' }
  pyroball: { inherit: true, isNonstandard: null }, // was { inherit: true, isNonstandard: 'Past' }
  revivalblessing: { inherit: true, isNonstandard: null }, // was { inherit: true, isNonstandard: 'Custom' }
  shiftgear: { inherit: true, isNonstandard: null }, // was { inherit: true, isNonstandard: 'Past' }
  zingzap: { inherit: true, isNonstandard: null }, // was { inherit: true, isNonstandard: 'Past' }
}
