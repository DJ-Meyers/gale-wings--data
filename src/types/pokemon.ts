import type { z } from 'zod'

import type {
  calcParametersSchema,
  championsPokemonSchema,
} from '~/schemas/pokemon'

export type ChampionsPokemon = z.infer<
  ReturnType<typeof championsPokemonSchema>
>

export type CalcParameters = z.infer<typeof calcParametersSchema>
