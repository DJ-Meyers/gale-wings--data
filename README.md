# @dj-meyers/gale-wings

Shared schemas, types, constants, and aliases for Gale Wings. Seven entry points:

- `@dj-meyers/gale-wings/schemas` — zod schemas (runtime-validatable; source of truth)
- `@dj-meyers/gale-wings/types` — domain types derived from the schemas via `z.infer`
- `@dj-meyers/gale-wings/constants` — species, items, moves, and regulation snapshots
- `@dj-meyers/gale-wings/dex` — regulation-aware `@pkmn/dex` accessors
- `@dj-meyers/gale-wings/aliases` — strictly-typed species/move/item alias maps
- `@dj-meyers/gale-wings/sprites` — `getSpriteUrl()` over a SHA-pinned `smogon/sprites` manifest
- `@dj-meyers/gale-wings/calc` — `@smogon/calc` wrapper (`computeDamage`, `toCalcPokemon`,
  `parsedPokemonToCalcSide`, condition registries) shared by every consumer that runs the calc

Consumed by both `gale-wings--api` (server runtime + tRPC procedure inputs) and
`gale-wings--client` (form schemas, types, client-side validation).

## Publishing

Published to GitHub Packages on push to `main` when `package.json` is bumped.
See `.github/workflows/publish.yml`.

## Changelog

### 2.1.2

- **Refactor `vgc2026_MB` to inherit from `vgc2026_MA`.** Champions formats
  are additive — each regulation strictly extends the previous — so M-B now
  spreads `vgc2026_MA.legalSpecies` / `legalItems` and appends a
  `m_b_additions` delta of net new species/items. Future regulation diffs
  surface as a short additions list rather than a full re-listed snapshot,
  and items can no longer accidentally drop from M-B by being omitted from
  a manually-maintained full list. Sorting + dedup are derived at module
  load and remain asserted by `regulation.test.ts`; two new assertions check
  `m_b_additions` itself is sorted and doesn't redeclare M-A entries.
- **Add `Eelektross-Mega` + `Eelektrossite` to `m_b_additions`.** Eelektross
  was legal in M-B but its Mega form and mega stone were omitted, so the api
  parser's mega-shorthand builder (which iterates
  `currentRegulation.legalSpecies`) never produced `MEelektross` / `Eel-Mega` /
  `EelektrossM` / etc. — they fell through to `prefixMatchSpecies` as
  unmatched tokens.
- **Remove non-legal entries from `vgc2026_MA.legalSpecies`** (and M-B
  inherits the removal): `Eiscue-Noice`, the four `Ogerpon-*-Tera` forms,
  and `Terapagos-Terastal`. None are available in Champions; they survived
  from an earlier copy-paste seed. Item lists in both regulations are
  validated clean against
  [Serebii's Champions items list](https://www.serebii.net/pokemonchampions/items.shtml).

### 2.1.1

- **Bump `@pkmn/{dex,mods,data}` to `^0.10.11`.** Upstream `0.10.11` (2026-06-18)
  resyncs the Champions-Mega ability tables from PS master. Before the bump,
  10 species in VGC 2026 M-B's legal pool inherited the base species'
  full ability table instead of their forced single-ability forme value —
  affecting Barbaracle-Mega, Dragalge-Mega, Falinks-Mega, Malamar-Mega,
  Pyroar-Mega, Raichu-Mega-X, Raichu-Mega-Y, Scolipede-Mega, Scrafty-Mega,
  and Staraptor-Mega. `0.10.11` also adds the `Fire Mane` ability (Pyroar-Mega's
  forced ability) to the bundled abilities table. No code changes in this
  package; the fix flows entirely through the dependency bump.

### 2.1.0

- **New `@dj-meyers/gale-wings/calc` subpath.** The damage-calc machinery
  that lived in `gale-wings--client/app/{calc,utils,data}/` moves into the
  data package so non-browser consumers (the Discord bot, future integrations)
  can run the calc without porting the @smogon/calc wrapping. Exports:
  - `computeDamage(attacker, defender, moveName, field, options?)` —
    Champions-aware wrapper around `@smogon/calc`'s `calculate`. Hardcodes
    `gameType: 'Doubles'` and `level: 50`. Returns `null` on unknown
    species / move.
  - `toCalcPokemon(pokemon, params, alliesFainted?)` — Champions Pokémon
    → @smogon/calc Pokemon adapter, including the non-linear stat-point →
    EV conversion and the Champions-mega items/species fall-throughs.
  - `parsedPokemonToCalcSide(parsed)` — `ParsedPokemon` (parser output)
    → `CalcSide` (calc input). Returns `null` when `species` or `ability`
    is missing. Lets clients of the api parser feed `computeDamage` by
    one path.
  - `gen` (Gen 9, Champions-aware), `hasSpecies`, `toSmogonName`,
    `toDisplayName`, `speciesOverride` — the Champions/@smogon/calc
    species name mapping.
  - `statPointToEv`, `statPointsToEvs` — non-linear stat-point conversion.
  - `isSpreadMove`, `multiHitRange`, `defaultHits` — move-shape lookups.
  - `conditionalBasePower`, `relevantConditions`, `MoveConditions`,
    `ConditionId`, `ConditionControl` — the history-dependent move
    registry (Last Respects, Rage Fist, doubling moves, base-power
    overrides, multi-hit overrides).
  - `computeCurHp`, `shouldActivateAbility`, `CalcSide`,
    `ComputeDamageOptions`, `DamageCalcResult` — supporting types and
    helpers exposed alongside `computeDamage`.

  Additive; existing entry points unchanged. `@smogon/calc@^0.11.0` was
  already a runtime dep of this package, so the move adds no new transitive
  deps to consumers.

### 2.0.1

- **Berry aliases filtered to Champions-legal items.** `item-aliases.ts`
  previously derived `"<X> Berry" → "<x>"` shorthands from the full
  `allItemNames` upstream snapshot, which includes ~50 legacy/contest-only
  berries (Gold, Bluk, Kee, Kelpsy, Pamtre, Pomeg, Wiki, …) flagged
  `isNonstandard:'Past'` in `@pkmn/mods/champions`. The auto-derived aliases
  were dead in practice (the items aren't legal in Champions) and one of
  them collided with an M-B species shorthand: `Gold Berry → 'gold'`
  shadowed `Gholdengo → 'Gold'`. Switched the derivation to
  `currentRegulation.legalItems`, so only the 28 Champions-legal berries
  get shorthand and the Gholdengo collision is resolved.
- **Poison Barb shorthand: `barb` → `PBarb`.** Renamed to avoid colliding
  with `Barbaracle → 'Barb'` (M-B species, parser order is item-before-
  species so the species shorthand was silently dead).

### 2.0.0

- **VGC 2026 Regulation Set M-B.** Adds `vgc2026_MB` as a sibling export of
  `vgc2026_MA` and re-points `currentRegulation` at it. M-B is a strict
  superset of M-A — every M-A species/item stays legal, plus 33 new species
  (19 new bare forms: Annihilape, Barbaracle, Blaziken, Dragalge, Eelektross,
  Falinks, Gholdengo, Grimmsnarl, Houndstone, Malamar, Mawile, Metagross,
  Overqwil, Pyroar, Sceptile, Scolipede, Scrafty, Staraptor, Swampert + 14
  new Megas), 15 newly-legal general items (Big Root, Damp/Heat/Icy/Smooth
  Rock, Expert Belt, Iron Ball, Life Orb, Light Clay, Metronome, Muscle Band,
  Shed Shell, Wide Lens, Wise Glasses, Zoom Lens), and 15 new Mega stones
  (Sceptilite, Blazikenite, Swampertite, Mawilite, Metagrossite, Raichunite
  X/Y, Staraptite, Scolipite, Scraftinite, Pyroarite, Malamarite, Barbaracite,
  Dragalgite, Falinksite). 30 curated species defaults added on top of M-A's
  73. Global alias maps (`species-aliases.ts`, `item-aliases.ts`) extended
  with the M-B CSV rows. **Breaking:** anything inferred off
  `currentRegulation.legalSpecies` / `.legalItems` now widens to the M-B
  literal unions (`Vgc2026_MBSpecies` / `Vgc2026_MBItem`). Consumers typed
  against `Vgc2026_MASpecies` / `…MAItem` directly continue to compile —
  both regulations remain exported and the `regulations` registry now keys
  both ids. The single point of change is still
  `data/src/constants/champions/regulation/index.ts`.
- **Upstream catch-up: bumps + drop `mega-species-patch.ts`.** `@smogon/calc`
  0.10.0 → 0.11.0, `@pkmn/{data,dex,mods}` 0.10.9 → 0.10.10, and
  `smogon/sprites` SHA pin advanced to `32a4c59…`. `@pkmn/mods/champions`
  0.10.10 now ships Pokedex/Species data for all 34 Champions Megas (the
  24 carried in M-A + the 10 added in M-B), so the local patch table is
  gone and `dex.species.get('pyroarmega'|'raichumegax'|'floettemega'|…)`
  resolves natively. The new sprite SHA fills sprite entries for the 10
  M-B Champions-custom Megas; the drift test now asserts every legal mega
  in `currentRegulation` has a sprite, with no per-mega carve-outs.
  Two Champions-new abilities the calc still doesn't know (`Fire Mane` on
  Pyroar-Mega, `Eelevate` on Eelektross) continue to be stubbed with the
  forme's forced ability (Rivalry / Levitate) until upstream catches up.
- **Mega defaults: ability fields stripped.** `Raichu-Mega-X` /
  `Raichu-Mega-Y` no longer carry an explicit `ability` field in
  `vgc2026_MBDefaults`. The forme has a single forced ability and
  `dex.attachDefaults` falls back to `species.abilities[0]` for those rows,
  matching the CSV convention every other mega already followed.
- **Battle-only learnset walk.** `effectiveLearnset` now prefers
  `species.battleOnly` over `species.baseSpecies` when walking up for
  additive/empty-own formes. Upstream `@pkmn/mods/champions` 0.10.10 sets
  `Floette-Mega.baseSpecies = 'Floette'` (generic) but
  `battleOnly = 'Floette-Eternal'` (the actual mega-stone holder); the
  walk now lands on Floette-Eternal's pool, so Light of Ruin remains
  legal on Floette-Mega via the per-species schema. Same fix covers
  Meowstic-F-Mega → Meowstic-F, plus Zygarde-Mega, Magearna-Original-Mega,
  and the two Tatsugiri-Mega formes (none currently in M-B legal pool,
  but the routing is correct if they ever land in a future regulation).
  Array-valued `battleOnly` (Zygarde-Mega) picks the first entry.
- **Format-illegal moves filtered out of learnsets.** `effectiveLearnset`,
  `getOwnMoveNamesOf`, and `getEffectiveMoveNamesOf` now drop move IDs
  whose `Moves[id].isNonstandard` is truthy ('Past', 'Future', 'CAP',
  'Custom', 'Gigantamax', 'LGPE'). The Champions mod bans Hidden Power,
  Tera Blast, Happy Hour, and ~400 other moves at the move level via
  `isNonstandard:'Past'`, but only trims them out of the per-species
  Learnsets table for species explicitly overridden by the mod. Species
  that inherit Gen 9 vanilla learnsets (Floette, Annihilape, Pyroar,
  Eelektross, Sceptile, Blaziken, Gholdengo, …) were leaking these moves
  into both the global `championsMovesSchema` pool and per-species move
  validation. Global `legalMoves` count drops 595 → 490 under M-B.

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
