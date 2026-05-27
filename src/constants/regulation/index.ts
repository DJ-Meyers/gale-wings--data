import { vgc2026M_A } from './vgc2026M_A'

export { vgc2026M_A, type Vgc2026M_AItem, type Vgc2026M_ASpecies } from './vgc2026M_A'

export const regulations = {
  Vgc2026M_A: vgc2026M_A,
} as const

export type RegulationId = keyof typeof regulations

// Single point of change when the next regulation goes live: re-point this at
// the new sibling export (e.g. `vgc2026M_B`).
export const currentRegulation = vgc2026M_A
