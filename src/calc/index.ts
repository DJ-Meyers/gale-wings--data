export { statPointToEv, statPointsToEvs } from './stat-points.js'
export { toCalcPokemon } from './champions-pokemon.js'
export {
  gen,
  hasSpecies,
  toSmogonName,
  toDisplayName,
  speciesOverride,
} from './gen.js'
export { isSpreadMove } from './is-spread-move.js'
export { multiHitRange, defaultHits } from './multi-hit.js'
export {
  conditionalBasePower,
  relevantConditions,
  type ConditionId,
  type ConditionControl,
  type MoveConditions,
} from './move-conditions.js'
export {
  computeDamage,
  computeCurHp,
  shouldActivateAbility,
  type CalcSide,
  type ComputeDamageOptions,
  type DamageCalcResult,
} from './compute-damage.js'
export { parsedPokemonToCalcSide } from './parsed-to-calc-side.js'
