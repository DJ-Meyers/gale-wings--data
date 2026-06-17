import type { FieldConditions } from '~/types/field-conditions'
import type { ParseInputResult } from '~/types/parser'

/**
 * Expected shape of the `parseVs` result the api server produces. Mirrors
 * the `VsResult` interface in `gale-wings--api/packages/server/src/parser/parser.ts`
 * and the `VsParseResult` interface in `gale-wings--client/app/hooks/api/data.ts`
 * — kept here as the cross-repo source of truth.
 */
export interface VsParseFixtureExpected {
  attacker: ParseInputResult
  defender: ParseInputResult
  fieldConditions: FieldConditions
}

/**
 * A single parse-corpus fixture: a `parseVs` input string paired with the
 * `VsParseResult` it is expected to produce, plus tags describing what the
 * fixture is meant to exercise.
 *
 * Each fixture is meant to drive five layers:
 *  1. data tests — `fieldConditionsSchema.parse(fixture.expected.fieldConditions)`
 *  2. api parser tests — `expect(parseVsInput(fixture.input)).toMatchObject(fixture.expected)`
 *  3. client `applyParseResult` tests — `applyParseResult(fixture.expected)` then
 *     assert the store landed in the right shape
 *  4. api post-deploy smoke — POST `fixture.input` to `/api/trpc/parser.parseVs`,
 *     compare to `fixture.expected` with `toMatchObject` semantics
 *  5. client post-deploy smoke (Playwright) — type `fixture.input` into the
 *     real UI, assert visible toggle states match `fixture.expected`
 */
export interface ParseFixture {
  readonly id: string
  readonly input: string
  readonly expected: VsParseFixtureExpected
  /** Free-form tags describing which parser feature(s) the fixture exercises. */
  readonly exercises?: readonly string[]
}

/**
 * Shared `parseVs` fixture corpus. Snapshots of current parser behavior —
 * a fixture failing means either the parser regressed or the fixture went
 * stale. Resolve by deciding which is correct, then updating the loser.
 *
 * Buckets:
 *  - `minimal-*`     — single-field anchors with NON-default tokens so the
 *                      assertions prove parsing rather than locking the
 *                      species-curated defaults system
 *  - `alias-*`       — exercises alias-map resolution
 *  - `field-*`       — exercises weather / terrain / side conditions
 *  - `negative-*`    — empty / malformed / unmatched-token inputs
 *  - `kitchen-sink-*` — long realistic inputs hitting many passes at once
 *
 * **Consumer contract — use `toMatchObject`, not `toEqual`.** Fixtures
 * intentionally omit `pokemon.fieldConditions` from per-side blocks; only the
 * top-level `expected.fieldConditions` is the stable contract. The reason:
 * per-side `pokemon.fieldConditions` is transport state — `parseInput` runs
 * once per side and writes every condition (weather, terrain, gravity, ruin,
 * attackerSide, defenderSide) into the *processed* side's blob regardless of
 * which schema slot it ultimately lands in. `parseVsInput` then merges both
 * blobs into one top-level `fieldConditions` (see `mergeFieldConditions` in
 * `gale-wings--api/packages/server/src/parser/parser.ts`). That merge is
 * positionally invariant — moving `sun` or `Tailwind` from one side of `vs`
 * to the other produces the same top-level result — but the per-side
 * transport differs. Asserting on the merged top-level only keeps fixtures
 * stable under user-equivalent rewrites of the input.
 *
 * Adding a fixture is the lowest-cost way to extend coverage across all five
 * layers (data schema check, api parser, client store, api smoke, client
 * smoke) at once. Add a row, run the api seeder, paste the result.
 */
export const PARSE_CORPUS: readonly ParseFixture[] = [
  // --- minimal ---
  // Garchomp default: { Adamant, Earthquake, Rough Skin }
  // Hatterene default: { Quiet, Dazzling Gleam, Magic Bounce }
  // Each fixture picks NON-default move + nature so the assertions can't
  // be satisfied by the curated-defaults path alone.
  {
    id: 'minimal-species-vs-species',
    input: 'Jolly Garchomp Outrage vs Bold Hatterene Mystical Fire',
    exercises: [
      'species',
      'vs split',
      'non-default move (Outrage vs Earthquake; Mystical Fire vs Dazzling Gleam)',
      'non-default nature (Jolly vs Adamant; Bold vs Quiet)',
    ],
    expected: {
      attacker: {
        pokemon: {
          nature: 'Jolly',
          species: 'Garchomp',
          move: 'Outrage',
          ability: 'Rough Skin',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          nature: 'Bold',
          species: 'Hatterene',
          move: 'Mystical Fire',
          ability: 'Magic Bounce',
        },
        errors: [],
      },
      fieldConditions: {},
    },
  },
  {
    id: 'minimal-attacker-only',
    input: 'Garchomp Outrage',
    exercises: [
      'attacker-only (no vs)',
      'non-default move (Outrage vs Earthquake)',
    ],
    expected: {
      attacker: {
        pokemon: {
          species: 'Garchomp',
          move: 'Outrage',
          nature: 'Adamant',
          ability: 'Rough Skin',
        },
        errors: [],
      },
      defender: {
        pokemon: { nature: 'Serious' },
        errors: [],
      },
      fieldConditions: {},
    },
  },
  {
    id: 'minimal-nature-and-stats',
    input: '32+ SpA Gardevoir Dazzling Gleam vs 4 HP Jolly Garchomp Outrage',
    exercises: [
      'statPoints (attacker invested, defender HP)',
      'nature inference (Modest from 32+ SpA on attacker)',
      'non-default nature (Jolly vs Adamant on defender)',
      'non-default move (Outrage vs Earthquake on defender)',
    ],
    expected: {
      attacker: {
        pokemon: {
          statPoints: { spa: 32 },
          species: 'Gardevoir',
          move: 'Dazzling Gleam',
          nature: 'Modest',
          ability: 'Synchronize',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          statPoints: { hp: 4 },
          nature: 'Jolly',
          species: 'Garchomp',
          move: 'Outrage',
          ability: 'Rough Skin',
        },
        errors: [],
      },
      fieldConditions: {},
    },
  },

  // --- minimal: per-pokemon damage-calc modifiers ---
  // Each fixture isolates one ParsedPokemon key the rest of the corpus
  // doesn't cover. Drives Bucket 2b's POKEMON_COVERAGE_EXEMPTIONS list down.
  {
    id: 'minimal-status-brn',
    input: 'brn Garchomp vs Hatterene',
    exercises: ['status:brn (attacker; 3-letter code alias)'],
    expected: {
      attacker: {
        pokemon: {
          status: 'brn',
          species: 'Garchomp',
          move: 'Earthquake',
          nature: 'Adamant',
          ability: 'Rough Skin',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          species: 'Hatterene',
          move: 'Dazzling Gleam',
          nature: 'Quiet',
          ability: 'Magic Bounce',
        },
        errors: [],
      },
      fieldConditions: {},
    },
  },
  {
    id: 'minimal-crit',
    input: 'Garchomp crit vs Hatterene',
    exercises: ['isCrit (attacker)'],
    expected: {
      attacker: {
        pokemon: {
          isCrit: true,
          species: 'Garchomp',
          move: 'Earthquake',
          nature: 'Adamant',
          ability: 'Rough Skin',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          species: 'Hatterene',
          move: 'Dazzling Gleam',
          nature: 'Quiet',
          ability: 'Magic Bounce',
        },
        errors: [],
      },
      fieldConditions: {},
    },
  },
  {
    id: 'minimal-base-power-override',
    input: 'Garchomp 120BP vs Hatterene',
    exercises: ['basePowerOverride:120 (attacker; glued <digits>BP form)'],
    expected: {
      attacker: {
        pokemon: {
          basePowerOverride: 120,
          species: 'Garchomp',
          move: 'Earthquake',
          nature: 'Adamant',
          ability: 'Rough Skin',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          species: 'Hatterene',
          move: 'Dazzling Gleam',
          nature: 'Quiet',
          ability: 'Magic Bounce',
        },
        errors: [],
      },
      fieldConditions: {},
    },
  },
  {
    id: 'minimal-hp-percent',
    input: 'Garchomp vs 50% Hatterene',
    exercises: ['hpPercent:50 (defender; % form — only hpPercent populated)'],
    expected: {
      attacker: {
        pokemon: {
          species: 'Garchomp',
          move: 'Earthquake',
          nature: 'Adamant',
          ability: 'Rough Skin',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          hpPercent: 50,
          species: 'Hatterene',
          move: 'Dazzling Gleam',
          nature: 'Quiet',
          ability: 'Magic Bounce',
        },
        errors: [],
      },
      fieldConditions: {},
    },
  },
  {
    // Fraction form: both operands MUST exceed 32 to disambiguate from the
    // statPoints shorthand pass. Sets currentHp + maxHp from the literals;
    // hpPercent is computed as currentHp / maxHp * 100.
    id: 'minimal-hp-fraction',
    input: 'Garchomp vs 100/177 Hatterene',
    exercises: [
      'currentHp:100 (defender)',
      'maxHp:177 (defender)',
      'hpPercent: computed from fraction (100/177 ≈ 56.497)',
      'both operands > 32 to disambiguate from statPoints shorthand',
    ],
    expected: {
      attacker: {
        pokemon: {
          species: 'Garchomp',
          move: 'Earthquake',
          nature: 'Adamant',
          ability: 'Rough Skin',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          currentHp: 100,
          maxHp: 177,
          hpPercent: 56.49717514124294,
          species: 'Hatterene',
          move: 'Dazzling Gleam',
          nature: 'Quiet',
          ability: 'Magic Bounce',
        },
        errors: [],
      },
      fieldConditions: {},
    },
  },

  // --- alias-heavy ---
  {
    id: 'alias-maus-popbomb-incin',
    input: '-1 32 Atk Maus PopBomb 10 vs 32/14 Incin',
    exercises: [
      'speciesAlias:Maus',
      'speciesAlias:Incin',
      'moveAlias:PopBomb',
      'hits:10',
      'attacker boost -1',
    ],
    expected: {
      attacker: {
        pokemon: {
          statPoints: { atk: 32 },
          species: 'Maushold',
          move: 'Population Bomb',
          hits: 10,
          boosts: { atk: -1 },
          nature: 'Serious',
          ability: 'Friend Guard',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          statPoints: { hp: 32, def: 14 },
          species: 'Incineroar',
          move: 'Flare Blitz',
          nature: 'Serious',
          ability: 'Intimidate',
        },
        errors: [],
      },
      fieldConditions: {},
    },
  },
  {
    id: 'alias-pterr-fg-venum',
    input: '32+ Hatt PTerr EForce vs FG Venu-M',
    exercises: [
      'speciesAlias:Hatt',
      'terrainAlias:PTerr',
      'moveAlias:EForce',
      'sideAlias:FG',
      'speciesAlias:Venu-M',
    ],
    expected: {
      attacker: {
        pokemon: {
          species: 'Hatterene',
          move: 'Expanding Force',
          statPoints: { spa: 32 },
          nature: 'Modest',
          ability: 'Magic Bounce',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          species: 'Venusaur-Mega',
          move: 'Sludge Bomb',
          nature: 'Modest',
          ability: 'Thick Fat',
          item: 'Venusaurite',
        },
        errors: [],
      },
      fieldConditions: {
        terrain: 'Psychic',
        defenderSide: { isFriendGuard: true },
      },
    },
  },
  {
    id: 'alias-basc-lr3-zardy',
    input: '32+ Basc LR3 vs 24/14 ZardY',
    exercises: ['speciesAlias:Basc', 'moveAlias:LR3', 'speciesAlias:ZardY'],
    expected: {
      attacker: {
        pokemon: {
          species: 'Basculegion',
          move: 'Last Respects',
          alliesFainted: 3,
          statPoints: { atk: 32 },
          nature: 'Adamant',
          ability: 'Adaptability',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          statPoints: { hp: 24, def: 14 },
          species: 'Charizard-Mega-Y',
          move: 'Heat Wave',
          nature: 'Serious',
          ability: 'Drought',
          item: 'Charizardite Y',
        },
        errors: [],
      },
      fieldConditions: { weather: 'Sun' },
    },
  },

  // --- field-condition-heavy ---
  {
    id: 'field-sun-tailwind-vs-reflect-fg',
    input: 'sun Tailwind Hatterene vs Reflect Friend Guard Incineroar',
    exercises: [
      'weather:Sun',
      'attackerSide:isTailwind',
      'defenderSide:isReflect',
      'defenderSide:isFriendGuard',
    ],
    expected: {
      attacker: {
        pokemon: {
          species: 'Hatterene',
          move: 'Dazzling Gleam',
          nature: 'Quiet',
          ability: 'Magic Bounce',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          species: 'Incineroar',
          move: 'Flare Blitz',
          nature: 'Careful',
          ability: 'Intimidate',
        },
        errors: [],
      },
      fieldConditions: {
        weather: 'Sun',
        attackerSide: { isTailwind: true },
        defenderSide: { isReflect: true, isFriendGuard: true },
      },
    },
  },
  {
    id: 'field-terrain-collision-across-vs',
    input: 'Hatterene EForce psychic terrain vs PTerr Garchomp',
    exercises: ['terrain:Psychic (terrain typed two ways across the split)'],
    expected: {
      attacker: {
        pokemon: {
          species: 'Hatterene',
          move: 'Expanding Force',
          nature: 'Quiet',
          ability: 'Magic Bounce',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          species: 'Garchomp',
          move: 'Earthquake',
          nature: 'Adamant',
          ability: 'Rough Skin',
        },
        errors: [],
      },
      fieldConditions: { terrain: 'Psychic' },
    },
  },
  {
    id: 'field-veil-derives-snow-helping-hand',
    input: 'HH Glasses KG SP vs Veil MFross',
    exercises: [
      'sideAlias:HH (attacker)',
      'sideAlias:Veil (defender; derives weather:Snow via ability)',
      'speciesAlias:KG',
      'speciesAlias:MFross',
      'moveAlias:SP',
      'itemAlias:Glasses',
    ],
    expected: {
      attacker: {
        pokemon: {
          item: 'Black Glasses',
          species: 'Kingambit',
          move: 'Sucker Punch',
          nature: 'Adamant',
          ability: 'Defiant',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          species: 'Froslass-Mega',
          move: 'Blizzard',
          nature: 'Timid',
          ability: 'Snow Warning',
          item: 'Froslassite',
        },
        errors: [],
      },
      fieldConditions: {
        weather: 'Snow',
        attackerSide: { isHelpingHand: true },
        defenderSide: { isAuroraVeil: true },
      },
    },
  },

  // --- negative / edge ---
  {
    id: 'negative-empty-input',
    input: '',
    exercises: ['empty input — both sides default'],
    expected: {
      attacker: { pokemon: { nature: 'Serious' }, errors: [] },
      defender: { pokemon: { nature: 'Serious' }, errors: [] },
      fieldConditions: {},
    },
  },
  {
    id: 'negative-only-vs-separator',
    input: 'vs',
    exercises: ['bare "vs" with no tokens on either side'],
    expected: {
      attacker: {
        pokemon: { move: 'Volt Switch', nature: 'Serious' },
        errors: [],
      },
      defender: { pokemon: { nature: 'Serious' }, errors: [] },
      fieldConditions: {},
    },
  },
  {
    id: 'negative-bare-numerals-unmatched',
    input: '32 32 32 32 32 32 32 32 Garchomp',
    exercises: [
      '8 bare numerals with no stat-keyword adjacency — all unmatched, species still resolves',
    ],
    expected: {
      attacker: {
        pokemon: {
          species: 'Garchomp',
          move: 'Earthquake',
          nature: 'Adamant',
          ability: 'Rough Skin',
        },
        errors: [
          { kind: 'unmatched', token: '32' },
          { kind: 'unmatched', token: '32' },
          { kind: 'unmatched', token: '32' },
          { kind: 'unmatched', token: '32' },
          { kind: 'unmatched', token: '32' },
          { kind: 'unmatched', token: '32' },
          { kind: 'unmatched', token: '32' },
          { kind: 'unmatched', token: '32' },
        ],
      },
      defender: { pokemon: { nature: 'Serious' }, errors: [] },
      fieldConditions: {},
    },
  },

  // --- kitchen-sink ---
  {
    id: 'kitchen-sink-attacker-all-fields',
    input: '-1 32+ 14HP Hatt scarf Modest EForce vs Garchomp',
    exercises: [
      'attacker boost -1',
      'statPoints +invested',
      'HP shorthand',
      'itemAlias:scarf',
      'nature explicit',
      'moveAlias:EForce',
    ],
    expected: {
      attacker: {
        pokemon: {
          statPoints: { hp: 14, spa: 32 },
          species: 'Hatterene',
          item: 'Choice Scarf',
          nature: 'Modest',
          move: 'Expanding Force',
          boosts: { spa: -1 },
          ability: 'Magic Bounce',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          species: 'Garchomp',
          move: 'Earthquake',
          nature: 'Adamant',
          ability: 'Rough Skin',
        },
        errors: [],
      },
      fieldConditions: {},
    },
  },
  {
    id: 'kitchen-sink-defender-all-fields',
    input: 'Hatterene vs 32 HP 21 Def Impish Garchomp Yache Berry Sand Veil',
    exercises: [
      'defender statPoints',
      'defender nature',
      'defender item',
      'defender ability:Sand Veil (disambiguates from "Sand" weather + "Veil" alias via bidirectional entity-fragment guard)',
    ],
    expected: {
      attacker: {
        pokemon: {
          species: 'Hatterene',
          move: 'Dazzling Gleam',
          nature: 'Quiet',
          ability: 'Magic Bounce',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          statPoints: { hp: 32, def: 21 },
          nature: 'Impish',
          species: 'Garchomp',
          item: 'Yache Berry',
          ability: 'Sand Veil',
          move: 'Earthquake',
        },
        errors: [],
      },
      fieldConditions: {},
    },
  },
  {
    id: 'kitchen-sink-excadrill-sand-tomb',
    input:
      'Sandstorm Sand Force Excadrill Sand Tomb vs 32 HP 21 Def Impish Garchomp',
    exercises: [
      'weather:Sand',
      'ability "Sand Force" (Sand-prefixed)',
      'move "Sand Tomb" (Sand-prefixed)',
      'same-word collisions across weather / ability / move passes',
    ],
    expected: {
      attacker: {
        pokemon: {
          ability: 'Sand Force',
          species: 'Excadrill',
          move: 'Sand Tomb',
          nature: 'Adamant',
        },
        errors: [],
      },
      defender: {
        pokemon: {
          statPoints: { hp: 32, def: 21 },
          nature: 'Impish',
          species: 'Garchomp',
          move: 'Earthquake',
          ability: 'Rough Skin',
        },
        errors: [],
      },
      fieldConditions: { weather: 'Sand' },
    },
  },
] as const satisfies readonly ParseFixture[]
