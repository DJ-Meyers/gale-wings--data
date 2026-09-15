// Regenerate src/vendor/champions/*.json against a pinned
// smogon/pokemon-showdown commit.
//
// Usage:
//   pnpm build:champions-data                    # regenerate at the pinned SHA
//   SHOWDOWN_SHA=<40-char-sha> pnpm build:champions-data   # bump the pin
//
// Find a SHA with: gh api repos/smogon/pokemon-showdown/commits/master --jq .sha
//
// The Champions mod files upstream are near-declarative TypeScript: each one
// exports a single object literal (`export const X: <type> = { ... }`) whose
// only non-JSON content is function-valued fields (battle callbacks on moves /
// items / abilities). The dex layer (@pkmn/dex's Dex.mod) never reads those —
// they only matter to the @pkmn/sim battle engine — so this script evaluates
// each table and serializes it to JSON, which drops function properties by
// definition (JSON.stringify skips them). `inherit: true` markers and
// `null`-deletion sentinels survive: Dex.mod's loader depends on both.
//
// Pinning to a SHA (not a branch ref) is load-bearing: raw.githubusercontent
// SHA refs are immutable, so the vendored JSON is reproducible from meta.json
// alone. The JSON is committed and bumps are intentional; this script is not
// wired into CI or `pnpm build`. src/vendor/champions/drift.test.ts warns
// when master moves past the pin.

import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const DEFAULT_SHOWDOWN_SHA = 'c23d2e942c9c0daadb13a7162a385bf78e3c9353'
const SHA = process.env.SHOWDOWN_SHA ?? DEFAULT_SHOWDOWN_SHA
if (!/^[0-9a-f]{40}$/.test(SHA)) {
  console.error(
    'SHOWDOWN_SHA must be a 40-char commit SHA from smogon/pokemon-showdown.\n' +
      'Get one with: gh api repos/smogon/pokemon-showdown/commits/master --jq .sha',
  )
  process.exit(1)
}

const UPSTREAM_DIR = 'data/mods/champions'

// The five tables the dex layer consumes. The mod dir also carries
// conditions/formats/rulesets/scripts — sim-only: @pkmn/dex's loader ignores
// everything in them except Scripts.inherit (absent in the Champions mod, so
// the mod parents on gen9 either way) and merges the omitted tables straight
// from gen9. Vendoring them would add zero dex-visible data.
const FILES = [
  'abilities',
  'formats-data',
  'items',
  'learnsets',
  'moves',
] as const

// Fewer entries than this and the fetch almost certainly grabbed the wrong
// thing (error page, truncated body, upstream restructure).
// Calibration (M-C, c23d2e94): abilities 13, formats-data 1361, items 253,
// learnsets 263, moves 255. All but formats-data are override tables keyed by
// Champions-relevant entries only, so counts sit in the low hundreds.
const MIN_ENTRIES: Record<(typeof FILES)[number], number> = {
  abilities: 5,
  'formats-data': 500,
  items: 100,
  learnsets: 200,
  moves: 200,
}

const rawUrl = (file: string): string =>
  `https://raw.githubusercontent.com/smogon/pokemon-showdown/${SHA}/${UPSTREAM_DIR}/${file}.ts`

const fetchText = async (url: string): Promise<string> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`)
  }
  return res.text()
}

const outDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/vendor/champions',
)
mkdirSync(outDir, { recursive: true })

// Evaluate one upstream table: rewrite the single typed export to a default
// export (the annotation is the only type-level syntax outside function
// bodies), let tsx's loader import the temp .ts, then round-trip through
// JSON to drop the function-valued fields.
const tmp = mkdtempSync(join(tmpdir(), 'champions-data-'))
const sourceHashes: Record<string, string> = {}
try {
  for (const file of FILES) {
    const source = await fetchText(rawUrl(file))
    sourceHashes[`${file}.ts`] = createHash('sha256')
      .update(source)
      .digest('hex')

    const rewritten = source.replace(/^export const \w+[^=]*=/, 'export default')
    if (rewritten === source) {
      throw new Error(`${file}.ts: expected a single 'export const <Name>: <type> = {' header — upstream shape changed`)
    }
    const tmpFile = join(tmp, `${file.replace(/-/g, '_')}.ts`)
    writeFileSync(tmpFile, rewritten)

    const table = (await import(pathToFileURL(tmpFile).href)).default as Record<
      string,
      unknown
    >
    const json = JSON.parse(JSON.stringify(table)) as Record<string, unknown>
    const entries = Object.keys(json).length
    if (entries < MIN_ENTRIES[file]) {
      throw new Error(`${file}.ts: only ${entries} entries after evaluation (expected ≥ ${MIN_ENTRIES[file]})`)
    }

    const outPath = join(outDir, `${file}.json`)
    writeFileSync(outPath, JSON.stringify(json, null, 2) + '\n')
    console.log(`  ${file}.json: ${entries} entries`)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

const meta = {
  generatedAt: new Date().toISOString(),
  source: {
    repo: 'smogon/pokemon-showdown',
    ref: SHA,
    path: UPSTREAM_DIR,
  },
  // sha256 of each fetched upstream source file. drift.test.ts re-fetches at
  // the pinned ref to verify provenance, and at master to warn about drift.
  sourceHashes,
}
writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n')

console.log(
  `Wrote ${FILES.length} tables + meta.json to ${outDir}\n` +
    `  source: smogon/pokemon-showdown @ ${SHA} (${UPSTREAM_DIR})`,
)
