import type { StatKey, StatPoints } from '../types/index.js'

const STAT_KEYS: readonly StatKey[] = [
  'hp',
  'atk',
  'def',
  'spa',
  'spd',
  'spe',
] as const

// Champions stat-point → @smogon/calc EV conversion.
// Non-linear: first point is worth 4 EVs, each subsequent point adds 8.
// 0 SP = 0 EV, 1 SP = 4 EV, 2 SP = 12 EV, …, 32 SP = 252 EV.
export const statPointToEv = (sp: number): number =>
  sp <= 0 ? 0 : 4 + (sp - 1) * 8

export const statPointsToEvs = (sp: StatPoints): StatPoints => {
  const evs = {} as StatPoints
  for (const key of STAT_KEYS) {
    evs[key] = statPointToEv(sp[key])
  }
  return evs
}
