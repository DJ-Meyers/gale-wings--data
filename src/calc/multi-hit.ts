import { Move, toID } from '@smogon/calc'

import { gen } from './gen.js'

// The selectable hit-count range for a multi-hit move, or null when the move
// isn't multi-hit. @smogon/calc stores `multihit` as [min, max] for variable
// movers (Icicle Spear → [2, 5]) or a single number for fixed / up-to-N movers
// (Population Bomb → 10, Triple Axel → 3). We surface [min, max] either way so
// the toggle can bound its dropdown: a single N becomes 1..N so the user can
// still model fewer connects (a Triple Axel that only landed twice).
export const multiHitRange = (moveName: string): [number, number] | null => {
  if (!moveName) return null
  const multihit = gen.moves.get(toID(moveName))?.multihit
  if (multihit === undefined) return null
  return Array.isArray(multihit) ? [multihit[0], multihit[1]] : [1, multihit]
}

// The hit count @smogon/calc uses when none is forced — the value the toggle
// shows before the user picks one, so an untouched Icicle Spear reads "3"
// (the calc's own default) rather than a misleading 0. Returns 1 for moves the
// calc doesn't treat as multi-hit.
export const defaultHits = (moveName: string): number =>
  moveName ? new Move(gen, moveName).hits : 1
