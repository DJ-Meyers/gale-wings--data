import { vgc2026_MA } from './vgc-2026-m-a'
import { vgc2026_MB } from './vgc-2026-m-b'

export {
  vgc2026_MA,
  type Vgc2026_MAItem,
  type Vgc2026_MASpecies,
} from './vgc-2026-m-a'

export {
  vgc2026_MB,
  type Vgc2026_MBItem,
  type Vgc2026_MBSpecies,
  vgc2026_MB as currentRegulation,
} from './vgc-2026-m-b'

export const regulations = {
  vgc2026_MA,
  vgc2026_MB,
} as const

export type RegulationId = keyof typeof regulations

// Single point of change when the next regulation goes live: re-point this at
// the new sibling export (e.g. `vgc2026_MC`).
