# @dj-meyers/gale-wings

Shared schemas, types, constants, and aliases for Gale Wings. Six entry points:

- `@dj-meyers/gale-wings/schemas` — zod schemas (runtime-validatable; source of truth)
- `@dj-meyers/gale-wings/types` — domain types derived from the schemas via `z.infer`
- `@dj-meyers/gale-wings/constants` — species, items, moves, and regulation snapshots
- `@dj-meyers/gale-wings/dex` — regulation-aware `@pkmn/dex` accessors
- `@dj-meyers/gale-wings/aliases` — strictly-typed species/move/item alias maps
- `@dj-meyers/gale-wings/sprites` — `getSpriteUrl()` over a SHA-pinned `smogon/sprites` manifest

Consumed by both `gale-wings--api` (server runtime + tRPC procedure inputs) and
`gale-wings--client` (form schemas, types, client-side validation).

## Publishing

Published to GitHub Packages on push to `main` when `package.json` is bumped.
See `.github/workflows/publish.yml`.

## Changelog

### 1.6.0

- **`/test-fixtures` subpath export.** Adds `PARSE_CORPUS`, a shared
  cross-repo fixture corpus for `parseVs`. Each fixture is a `parseVs` input
  paired with its expected `VsParseResult` (`{ attacker, defender,
  fieldConditions }`) plus free-form `exercises` tags describing what the
  fixture is meant to cover. The corpus is the single source of truth for
  parser behavior — api parser tests, client `applyParseResult` tests, and
  post-deploy smoke jobs all loop the same fixtures, so adding one row
  extends coverage at every layer. Ships with 15 fixtures across five
  buckets (minimal / alias-heavy / field-condition-heavy / negative /
  kitchen-sink). Type exports: `ParseFixture`, `VsParseFixtureExpected`.
  **Consumer contract: use `toMatchObject`, not `toEqual`** — fixtures
  intentionally omit `pokemon.fieldConditions` from per-side blocks because
  that's parser-internal transport state, not stable contract. Only
  top-level `expected.fieldConditions` is asserted.

### 1.5.0

- **HP fields on `ParsedPokemon`: `hpPercent`, `currentHp`, `maxHp`.** Lets the
  parser surface current HP from two user-friendly input forms. A fraction
  like `165/177` populates `currentHp` and `maxHp` (and derives `hpPercent`);
  a percent like `85%` populates `hpPercent` only. All three are optional and
  carry no defaults — the parser only emits them when an HP token is present.
  The fields feed HP-scaling moves (Eruption / Water Spout / Reversal /
  Flail). The fraction form is preferred where the user provides it because
  `@smogon/calc` takes a raw `curHP`, not a percentage, so the fraction path
  avoids the percent→raw rounding the `%` form requires. When only
  `hpPercent` is set, the client converts to raw `curHP` using its locally
  computed max HP for the spread; when `currentHp`/`maxHp` are set, the
  client can cross-check `maxHp` against its own computed value and hand
  `currentHp` to the calc verbatim.

### 1.4.1

- **`alliesFainted` and `hits` on parse results and calc parameters.** Adds two
  optional fields in a single release. `alliesFainted?: number` (Supreme
  Overlord-style fallen-ally scaling) is bound to integers `0..5`, exported as
  `ALLIES_FAINTED_MIN` / `ALLIES_FAINTED_MAX`. `hits?: number` (multi-hit move
  override, e.g. Icicle Spear) is bound to the permissive global integer range
  `1..10`, exported as `HITS_MIN` / `HITS_MAX`; per-move validity (a move's own
  multihit range) is enforced parser-side. Both land on the `ParsedPokemon` type
  and on `calcParametersSchema`. Like `basePowerOverride`, both are optional with
  **no** default — "absent" stays distinguishable from "set" (including an
  explicit `0`), since the parser only emits each field when its matching token
  is present. Because `championsPokemonWithCalcParametersSchema` spreads
  `calcParametersSchema.shape`, saved calcs round-trip both fields with no
  further change.

### 1.4.0

- **`basePowerOverride` on parse results and calc parameters.** Adds an optional
  `basePowerOverride?: number` to the `ParsedPokemon` type and a matching
  `basePowerOverride` field on `calcParametersSchema`
  (`z.number().int().min(1).max(999).optional()`). The `1..999` sanity bound is
  exported as `BASE_POWER_OVERRIDE_MIN` / `BASE_POWER_OVERRIDE_MAX` so the
  `gale-wings--api` parser can reuse the exact same numbers when validating a
  `<n>BP` token instead of duplicating them. The field is optional with **no**
  default — "absent" stays distinguishable from "set," since the parser only
  emits it when a base-power token is present. Because
  `championsPokemonWithCalcParametersSchema` spreads `calcParametersSchema.shape`,
  saved calcs round-trip the override with no further change.

### 1.3.0

- **Per-regulation species defaults on `getSpecies()`.** The regulation now
  carries a curated `speciesDefaults` table (nature / signature move /
  ability per legal species), and `getSpecies(name)` attaches the active
  regulation's seed values directly to the returned `Species` as
  `defaultNature`, `defaultMove`, and `defaultAbility` — ready to drop into
  a form prefill without a second lookup. `defaultAbility` falls back to
  `species.abilities[0]` when the forme has a single forced ability (most
  Megas), so the curated table can omit ability for those rows. The
  defaults table is typed `Partial<Record<Vgc2026_MASpecies,
  SpeciesDefault>>`, so a species with no curated entry just yields
  `undefined` defaults (no validation failure). `SpeciesDefault` is derived
  from `speciesDefaultSchema` (`z.infer`), with `move` narrowed against
  `allMoveNames` — typos and out-of-pool moves fail `regulationSchema.parse`.
  73 species seeded for VGC 2026 Regulation Set M-A from the public
  community spread sheet; future regulations add a sibling
  `vgc-2026-m-*-defaults.ts` and re-point `currentRegulation`.

### 1.2.0

- **`/sprites` subpath export.** New `getSpriteUrl(name, { shiny? })` returns a
  jsDelivr URL pointing at `smogon/sprites/src/champions/<sid>.png` for any
  Champions-legal species, or `undefined` for unknown input. Backed by a
  generated `manifest.json` (321 entries, covering all 24 Champions-only
  Megas) whose `baseUrl` is pinned to a 40-char `smogon/sprites` commit SHA
  so jsDelivr can cache responses indefinitely. String inputs route through
  `getSpecies()`, so aliases like `KG` and `Meowstic-Mega` resolve to the
  right URL without a second alias table. The manifest is regenerated
  manually via `pnpm build:sprites` (with `SMOGON_SPRITES_SHA=<sha>`) — not
  wired into `pnpm build` or CI, so SHA bumps are intentional. A drift test
  asserts every species in `championsMegaSpeciesPatch` has a sprite, so
  future patch additions without a manifest refresh fail CI.

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
