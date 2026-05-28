import { vgc2026_MA } from './vgc-2026-m-a'

export {
  vgc2026_MA,
  type Vgc2026_MAItem,
  type Vgc2026_MASpecies, vgc2026_MA as currentRegulation,
} from './vgc-2026-m-a'

export const regulations = {
  vgc2026_MA,
} as const

export type RegulationId = keyof typeof regulations

// Single point of change when the next regulation goes live: re-point this at
// the new sibling export (e.g. `vgc2026_MB`).

