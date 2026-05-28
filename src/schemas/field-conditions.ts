import { z } from 'zod'

const attackerSideSchema = z.object({
  isHelpingHand: z.boolean().optional(),
  isTailwind: z.boolean().optional(),
  isFlowerGift: z.boolean().optional(),
  isPowerSpot: z.boolean().optional(),
  isBattery: z.boolean().optional(),
})

const defenderSideSchema = z.object({
  isReflect: z.boolean().optional(),
  isLightScreen: z.boolean().optional(),
  isAuroraVeil: z.boolean().optional(),
  isFriendGuard: z.boolean().optional(),
  isTailwind: z.boolean().optional(),
  isProtected: z.boolean().optional(),
})

const weatherSchema = z.literal([
  'Sun',
  'Rain',
  'Sand',
  'Snow',
  'Hail',
  'Harsh Sunshine',
  'Heavy Rain',
  'Strong Winds',
])
const terrainSchema = z.literal(['Electric', 'Grassy', 'Psychic', 'Misty'])

const fieldConditionsSchema = z.object({
  weather: weatherSchema.optional(),
  terrain: terrainSchema.optional(),
  isGravity: z.boolean().optional(),
  isMagicRoom: z.boolean().optional(),
  isWonderRoom: z.boolean().optional(),
  isBeadsOfRuin: z.boolean().optional(),
  isSwordOfRuin: z.boolean().optional(),
  isTabletsOfRuin: z.boolean().optional(),
  isVesselOfRuin: z.boolean().optional(),
  attackerSide: attackerSideSchema.optional(),
  defenderSide: defenderSideSchema.optional(),
})

export { fieldConditionsSchema }
