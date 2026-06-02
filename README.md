# @dj-meyers/gale-wings

Shared schemas, types, constants, and aliases for Gale Wings. Five entry points:

- `@dj-meyers/gale-wings/schemas` — zod schemas (runtime-validatable; source of truth)
- `@dj-meyers/gale-wings/types` — domain types derived from the schemas via `z.infer`
- `@dj-meyers/gale-wings/constants` — species, items, moves, and regulation snapshots
- `@dj-meyers/gale-wings/dex` — regulation-aware `@pkmn/dex` accessors
- `@dj-meyers/gale-wings/aliases` — strictly-typed species/move/item alias maps

Consumed by both `gale-wings--api` (server runtime + tRPC procedure inputs) and
`gale-wings--client` (form schemas, types, client-side validation).

## Publishing

Published to GitHub Packages on push to `main` when `package.json` is bumped.
See `.github/workflows/publish.yml`.

## Changelog

### 1.1.0

- **Champions mega species patch.** Add stats/types/abilities/weights for 24
  Champions-only Megas that `@pkmn/dex` and `@pkmn/mods/champions` ship
  without Pokedex/Species data (Clefable-Mega, Victreebel-Mega, Starmie-Mega,
  Dragonite-Mega, Meganium-Mega, Feraligatr-Mega, Skarmory-Mega,
  Chimecho-Mega, Froslass-Mega, Emboar-Mega, Excadrill-Mega, Chandelure-Mega,
  Golurk-Mega, Chesnaught-Mega, Delphox-Mega, Greninja-Mega, Floette-Mega,
  Meowstic-M-Mega, Meowstic-F-Mega, Hawlucha-Mega, Crabominable-Mega,
  Drampa-Mega, Scovillain-Mega, Glimmora-Mega). `dex.species.get(...)` on
  these IDs now returns a populated `Species` instead of an empty one.
  Stats/abilities sourced from Pikalytics's `CHAMPIONS_POKEDEX_PATCH`; stone
  item names from vgcmulticalc (only `Floettite` is Pikalytics-confirmed —
  expect the other 23 to be revised when authoritative Champions item names
  ship).
- **Meowstic-Mega gender default.** `Meowstic-Mega` (no gender specified)
  now resolves to `Meowstic-F-Mega` through both `dex.species.get(...)` and
  the `SPECIES_ALIASES` map. Upstream `@pkmn/dex` defaults the bare alias to
  the male form; stats are identical across genders.
- **Typed alias map folded into the dex resolver.** Every entry in
  `SPECIES_ALIASES` (built from `src/aliases/species-aliases.ts`) is now
  registered as a `@pkmn/dex` alias on the constructed dex, so nicknames
  like `Zard`, `Clef`, `KG` resolve through `dex.species.get(...)` in
  addition to the existing application-level `SPECIES_ALIASES.get(...)`
  lookup. `ModData.Aliases` is silently dropped by `Dex.mod`, so the
  override has to happen post-construction.

### 1.0.0

- Initial standalone release. Repo split from the monorepo; package renamed
  from `@dj-meyers/galewings` to `@dj-meyers/gale-wings`; `/router` entry
  point dropped; build/publish workflow ported.
