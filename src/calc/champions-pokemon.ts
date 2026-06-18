import { Pokemon } from '@smogon/calc'

import type { CalcParameters, ChampionsPokemon } from '../types/index.js'
import { gen, speciesOverride, toSmogonName } from './gen.js'
import { statPointsToEvs } from './stat-points.js'

// Champions battles are level-50 doubles. The Pokemon row does not carry
// a level field — clamping here keeps the boundary honest.
const CHAMPIONS_LEVEL = 50

// IVs default to 31 across the board when the pokemon does not specify
// per-stat values. Matches the API column default.
const PERFECT_IVS = {
  hp: 31,
  atk: 31,
  def: 31,
  spa: 31,
  spd: 31,
  spe: 31,
} as const

// Map a Champions Pokémon row + per-side calc parameters onto an
// @smogon/calc Pokemon. Sentinel '' values are normalised to undefined at
// the boundary.
//
// `alliesFainted` is optional and feeds @smogon/calc's native Supreme Overlord
// handling (Last Respects is driven separately via overrides.basePower).
export const toCalcPokemon = (
  pokemon: ChampionsPokemon,
  params: CalcParameters,
  alliesFainted?: number,
): Pokemon => {
  const smogonName = toSmogonName(pokemon.species)
  return new Pokemon(gen, smogonName, {
    level: CHAMPIONS_LEVEL,
    nature: pokemon.nature,
    ability: params.abilityOverride ?? pokemon.ability,
    item: pokemon.item || undefined,
    evs: statPointsToEvs(pokemon.statPoints),
    ivs: pokemon.ivs ?? PERFECT_IVS,
    teraType: params.teraType || undefined,
    boosts: params.boosts,
    status: params.status || undefined,
    abilityOn: params.abilityOn,
    boostedStat: params.boostedStat || undefined,
    alliesFainted,
    overrides: speciesOverride(smogonName),
  })
}
