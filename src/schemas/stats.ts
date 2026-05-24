import { z } from 'zod'

const statKeySchema = z.literal(['hp', 'atk', 'def', 'spa', 'spd', 'spe']);

const statPointValueSchema = z.number().int().min(0).max(32).default(0)

const statPointsSchema = z
  .record(statKeySchema, statPointValueSchema)
  .refine(
    (sp) => sp.hp + sp.atk + sp.def + sp.spa + sp.spd + sp.spe <= 66,
    { message: 'Total stat points must not exceed 66' },
  )

const statBoostValueSchema = z.number().int().min(-6).max(6).default(0);

const statBoostsSchema = z
  .record(statKeySchema, statBoostValueSchema)

const statAlignmentSchema = z.literal([
    'serious', 
    'lonely', 'adamant', 'naughty', 'brave',    // +Atk
    'bold', 'impish', 'lax', 'relaxed',         // +Def
    'modest', 'mild', 'rash', 'quiet',          // +SpA
    'calm', 'gentle', 'careful', 'sassy',       // +SpD
    'timid', 'hasty', 'jolly', 'naive'          // +Spe
]).default('serious');

export {
    statAlignmentSchema,
    statBoostsSchema,
    statKeySchema,
    statPointsSchema,
}