import type { z } from 'zod'
import type { fieldConditionsSchema } from '../schemas/field-conditions'

export type FieldConditions = z.infer<typeof fieldConditionsSchema>
