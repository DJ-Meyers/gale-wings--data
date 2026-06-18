import type {
  Boosts,
  CalcParameters,
  ChampionsPokemon,
  ParsedPokemon,
  StatPoints,
} from '../types/index.js'
import type { CalcSide } from './compute-damage.js'
import type { MoveConditions } from './move-conditions.js'

// Defaults mirror the zod schemas in `schemas/pokemon.ts` and `schemas/stats.ts`:
// nature 'Serious', empty teraType / status / boostedStat / move, 31 IVs,
// 0 stat points and boosts per stat.

const ZERO_STAT_POINTS: StatPoints = {
  hp: 0,
  atk: 0,
  def: 0,
  spa: 0,
  spd: 0,
  spe: 0,
}

const ZERO_BOOSTS: Boosts = {
  atk: 0,
  def: 0,
  spa: 0,
  spd: 0,
  spe: 0,
}

const fillStatPoints = (sp: Partial<StatPoints> | undefined): StatPoints => ({
  ...ZERO_STAT_POINTS,
  ...sp,
})

const fillBoosts = (b: Partial<Boosts> | undefined): Boosts => ({
  ...ZERO_BOOSTS,
  ...b,
})

// ParsedPokemon arrives as a flat shape with every field optional. CalcSide
// expects three structured slices: a ChampionsPokemon, a CalcParameters, and
// an optional MoveConditions. This splits and fills the parser output so both
// the client and the Discord bot reach computeDamage by the same path.
//
// Returns null when `species` or `ability` is missing — toCalcPokemon needs
// both to construct the @smogon/calc Pokemon. Callers that want to keep
// rendering despite a half-parsed input (e.g. the web sandbox) should call
// this only after their own validation gate.
export const parsedPokemonToCalcSide = (
  parsed: ParsedPokemon,
): CalcSide | null => {
  if (!parsed.species || !parsed.ability) return null

  const pokemon: ChampionsPokemon = {
    species: parsed.species,
    nature: parsed.nature ?? 'Serious',
    ability: parsed.ability,
    item: parsed.item,
    statPoints: fillStatPoints(parsed.statPoints),
    moves: parsed.move ? [parsed.move] : [],
  } as ChampionsPokemon

  const params: CalcParameters = {
    move: parsed.move ?? '',
    teraType: parsed.teraType ?? '',
    boosts: fillBoosts(parsed.boosts),
    status: parsed.status ?? '',
    isCrit: parsed.isCrit ?? false,
    abilityOn: parsed.abilityOn ?? false,
    boostedStat: (parsed.boostedStat ?? '') as CalcParameters['boostedStat'],
  }

  const conditions: MoveConditions = {
    alliesFainted: parsed.alliesFainted,
    basePowerOverride: parsed.basePowerOverride,
    hits: parsed.hits,
    hpPercent: parsed.hpPercent,
    currentHp: parsed.currentHp,
    maxHp: parsed.maxHp,
  }

  return { pokemon, params, conditions }
}
