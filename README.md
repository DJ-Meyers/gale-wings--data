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
