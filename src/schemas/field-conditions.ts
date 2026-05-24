import { z } from 'zod'


const attackerSideSchema = z.object({
  helpingHand: z.boolean().optional(),
  tailwind: z.boolean().optional(),
})

const defenderSideSchema = z.object({
  reflect: z.boolean().optional(),
  lightScreen: z.boolean().optional(),
  auroraVeil: z.boolean().optional(),
  friendGuard: z.boolean().optional(),
  tailwind: z.boolean().optional(),
})

const weatherSchema = z.literal(['sun', 'rain', 'sand', 'snow', 'hail']);
const terrainSchema = z.literal(['electric', 'grassy', 'psychic', 'misty']);
const ruinAbilitiesSchema = z
    .object({
      beads: z.boolean().optional(),
      sword: z.boolean().optional(),
      tablets: z.boolean().optional(),
      vessel: z.boolean().optional(),
    });

const fieldConditionsSchema = z.object({
  weather: weatherSchema.optional(),
  terrain: terrainSchema.optional(),
  ruinAbilities: ruinAbilitiesSchema.optional(),
  attackerSide: attackerSideSchema.optional(),
  defenderSide: defenderSideSchema.optional(),
})

export { fieldConditionsSchema }