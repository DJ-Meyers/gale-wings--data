import { z } from 'zod'

const statKeySchema = z.literal(['hp', 'atk', 'def', 'spa', 'spd', 'spe'])

const statKeyWithoutHpSchema = z.literal(['atk', 'def', 'spa', 'spd', 'spe'])

const statPointValueSchema = z.number().int().min(0).max(32).default(0)

const statPointsSchema = z
  .record(statKeySchema, statPointValueSchema)
  .refine((sp) => sp.hp + sp.atk + sp.def + sp.spa + sp.spd + sp.spe <= 66, {
    message: 'Total stat points must not exceed 66',
  })

const statBoostValueSchema = z.number().int().min(-6).max(6).default(0)

const boostsSchema = z.record(statKeyWithoutHpSchema, statBoostValueSchema)

const ivsSchema = z
  .record(statKeySchema, z.number().int().min(0).max(31).default(31))
  .optional()

const natureSchema = z
  .literal([
    'Serious',
    'Lonely',
    'Adamant',
    'Naughty',
    'Brave', // +Atk
    'Bold',
    'Impish',
    'Lax',
    'Relaxed', // +Def
    'Modest',
    'Mild',
    'Rash',
    'Quiet', // +SpA
    'Calm',
    'Gentle',
    'Careful',
    'Sassy', // +SpD
    'Timid',
    'Hasty',
    'Jolly',
    'Naive', // +Spe
  ])
  .default('Serious')

export {
  boostsSchema,
  ivsSchema,
  natureSchema,
  statKeySchema,
  statKeyWithoutHpSchema,
  statPointsSchema,
}
