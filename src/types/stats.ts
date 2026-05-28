import type { z } from 'zod'

import type {
  boostsSchema,
  ivsSchema,
  statPointsSchema,
} from '~/schemas/stats'

export type StatPoints = z.infer<typeof statPointsSchema>
export type Boosts = z.infer<typeof boostsSchema>
export type Ivs = z.infer<typeof ivsSchema>

export type StatKey = keyof StatPoints
