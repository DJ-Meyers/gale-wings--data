import { Field, Move, type Pokemon, calculate, toID } from '@smogon/calc'

import type {
  CalcParameters,
  ChampionsPokemon,
  FieldConditions,
} from '../types/index.js'
import { toCalcPokemon } from './champions-pokemon.js'
import { gen, hasSpecies, toSmogonName } from './gen.js'
import { isSpreadMove } from './is-spread-move.js'
import { conditionalBasePower, type MoveConditions } from './move-conditions.js'

// One side of a damage calc: the Pokémon row plus the per-side scenario
// parameters (tera, boosts, status, isCrit, etc.). `conditions` carries
// per-side state seeded by the parser or per-side toggles: history-dependent
// variable-power (`alliesFainted`, `hits`) plus HP-quantity (`hpPercent`,
// `currentHp`, `maxHp`). Read on BOTH sides — defender HP feeds the calc's
// KO chance, attacker HP feeds Reversal/Flail/Eruption-style base power.
export type CalcSide = {
  pokemon: ChampionsPokemon
  params: CalcParameters
  conditions?: MoveConditions
}

// Convert parsed HP-quantity state into a raw current-HP value for
// @smogon/calc. Fraction form (`100/177`) populates `currentHp` and we hand
// it through verbatim, clamped to the constructed Pokemon's max. Percent
// form (`85%`) populates only `hpPercent`; we compute curHP from the local
// max so rounding stays consistent with the displayed spread. Returns
// undefined when no HP state is set (calc defaults curHP = maxHP).
export const computeCurHp = (
  pokemon: Pokemon,
  conditions: MoveConditions | undefined,
): number | undefined => {
  const max = pokemon.maxHP()
  if (conditions?.currentHp !== undefined) {
    return Math.max(0, Math.min(conditions.currentHp, max))
  }
  if (conditions?.hpPercent !== undefined) {
    const raw = Math.round((max * conditions.hpPercent) / 100)
    return Math.max(0, Math.min(raw, max))
  }
  return undefined
}

export type DamageCalcResult = {
  desc: string
  range: [number, number]
  koChance: string
  defenderMaxHp: number
}

// Paradox abilities (Protosynthesis, Quark Drive) activate from weather
// or terrain. Callers don't toggle abilityOn themselves — this derives it.
//
// Booster Energy is the canonical third trigger for both abilities,
// but it isn't in the current Champions regulation's `legalItems` list
// (vgc-2026-m-a). When it returns, also re-enable the commented checks
// below — the rest of the wiring stays identical.
export const shouldActivateAbility = (
  pokemon: ChampionsPokemon,
  params: CalcParameters,
  field: FieldConditions,
): boolean => {
  if (params.abilityOn) return true
  const ability = params.abilityOverride ?? pokemon.ability
  if (
    ability === 'Protosynthesis' &&
    field.weather === 'Sun'
    // || pokemon.item === 'Booster Energy'   // re-enable when item returns to legalItems
  )
    return true
  if (
    ability === 'Quark Drive' &&
    field.terrain === 'Electric'
    // || pokemon.item === 'Booster Energy'   // re-enable when item returns to legalItems
  )
    return true
  return false
}

// Wrapper around @smogon/calc's calculate.
// - Takes per-side Pokémon + calc parameters.
// - Routes attacker isCrit into Move construction.
// - Defaults boostedStat to 'auto' when Paradox is active and no
//   explicit pick was made.
// - Hardcodes gameType: 'Doubles'.
// - Returns null on any unknown species / move / calc error.
export type ComputeDamageOptions = {
  // When true and the move is a spread move (allAdjacent / allAdjacentFoes),
  // override the move target to 'normal' so @smogon/calc skips the 0.75×
  // spread modifier — i.e. the result for "what if this Heat Wave only hit
  // one Pokémon".
  isSingleTarget?: boolean
}

export const computeDamage = (
  attacker: CalcSide,
  defender: CalcSide,
  moveName: string,
  field: FieldConditions,
  options: ComputeDamageOptions = {},
): DamageCalcResult | null => {
  try {
    if (!hasSpecies(toSmogonName(attacker.pokemon.species))) return null
    if (!hasSpecies(toSmogonName(defender.pokemon.species))) return null
    if (!gen.moves.get(toID(moveName))) return null

    const atkAbilityOn = shouldActivateAbility(
      attacker.pokemon,
      attacker.params,
      field,
    )
    const defAbilityOn = shouldActivateAbility(
      defender.pokemon,
      defender.params,
      field,
    )

    const atkParams: CalcParameters = {
      ...attacker.params,
      abilityOn: atkAbilityOn,
      boostedStat: atkAbilityOn
        ? attacker.params.boostedStat || 'auto'
        : '',
    }
    const defParams: CalcParameters = {
      ...defender.params,
      abilityOn: defAbilityOn,
      boostedStat: defAbilityOn
        ? defender.params.boostedStat || 'auto'
        : '',
    }

    const conditions = attacker.conditions ?? {}
    const atkPoke = toCalcPokemon(
      attacker.pokemon,
      atkParams,
      conditions.alliesFainted,
    )
    const defPoke = toCalcPokemon(defender.pokemon, defParams)

    // HP-quantity state from parsed `100/177` / `85%` tokens (or a future
    // manual HP slider) shifts the calc's KO math and HP-scaling base power
    // for both sides. @smogon/calc exposes `originalCurHP` as the per-side
    // current-HP knob; setting it post-construction is the cheapest path
    // (avoids reconstructing the Pokemon just to override curHP).
    const atkCurHp = computeCurHp(atkPoke, attacker.conditions)
    if (atkCurHp !== undefined) atkPoke.originalCurHP = atkCurHp
    const defCurHp = computeCurHp(defPoke, defender.conditions)
    if (defCurHp !== undefined) defPoke.originalCurHP = defCurHp

    // History-dependent moves (Last Respects, Rage Fist, …) aren't in the
    // calc's base-power switch, so drive them through overrides.basePower; it's
    // the pre-modifier base, so STAB/items/BP-mods still chain on top.
    const basePower = conditionalBasePower(moveName, conditions)
    const spreadOverride =
      options.isSingleTarget && isSpreadMove(moveName)
        ? ({ target: 'normal' } as const)
        : undefined
    const overrides =
      basePower !== undefined
        ? { ...spreadOverride, basePower }
        : spreadOverride

    const move = new Move(gen, moveName, {
      isCrit: attacker.params.isCrit || undefined,
      overrides,
      // `hits` from a `5 hits` token overrides the move's native multi-hit
      // roll; absent leaves @smogon/calc to pick its own (random) count.
      ...(conditions.hits !== undefined && { hits: conditions.hits }),
    })

    const calcField = new Field({
      gameType: 'Doubles',
      weather: field.weather,
      terrain: field.terrain,
      isGravity: field.isGravity,
      isMagicRoom: field.isMagicRoom,
      isWonderRoom: field.isWonderRoom,
      isBeadsOfRuin: field.isBeadsOfRuin,
      isSwordOfRuin: field.isSwordOfRuin,
      isTabletsOfRuin: field.isTabletsOfRuin,
      isVesselOfRuin: field.isVesselOfRuin,
      attackerSide: field.attackerSide,
      defenderSide: field.defenderSide,
    })

    const result = calculate(gen, atkPoke, defPoke, move, calcField)
    const range = result.range() as [number, number]
    const defenderMaxHp = defPoke.maxHP()

    // Immunities (no-damage hits) make @smogon/calc's desc() and kochance()
    // throw, so short-circuit before calling them.
    if (range[1] === 0) {
      return { desc: '', range, koChance: '', defenderMaxHp }
    }

    return {
      desc: result.desc(),
      range,
      koChance: result.kochance()?.text ?? '',
      defenderMaxHp,
    }
  } catch {
    return null
  }
}
