import type { z } from 'zod'

import type { championsPokemonSchema } from '~/schemas/pokemon'

export type ChampionsPokemon = z.infer<
  ReturnType<typeof championsPokemonSchema>
>
