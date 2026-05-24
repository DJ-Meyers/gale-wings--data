import type { z } from 'zod'

import type { statBoostsSchema, statPointsSchema } from '../schemas/stats'


export type StatPoints = z.infer<typeof statPointsSchema>
export type StatBoosts = z.infer<typeof statBoostsSchema>


export type StatKey = keyof StatPoints
