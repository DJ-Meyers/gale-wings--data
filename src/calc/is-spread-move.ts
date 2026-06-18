import { toID } from '@smogon/calc'

import { gen } from './gen.js'

// True for moves whose @smogon/calc target hits multiple Pokémon in doubles
// (the targets that trigger the 0.75× spread modifier): Heat Wave / Rock Slide
// (allAdjacentFoes) and Earthquake / Surf (allAdjacent — hits the ally too).
export const isSpreadMove = (moveName: string): boolean => {
  if (!moveName) return false
  const move = gen.moves.get(toID(moveName))
  return move?.target === 'allAdjacent' || move?.target === 'allAdjacentFoes'
}
