// Regenerate src/sprites/manifest.json against a pinned smogon/sprites commit.
//
// Usage:
//   SMOGON_SPRITES_SHA=<40-char-sha> pnpm build:sprites
//
// Find a SHA with: gh api repos/smogon/sprites/commits/master --jq .sha
//
// Pinning to a SHA (not a branch ref) is load-bearing: jsDelivr caches SHA
// refs indefinitely, branch refs ~10 min. The manifest is committed and bumps
// are intentional; this script is not wired into CI or `pnpm build`.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { getSpecies } from '../src/dex'

const SHA = process.env.SMOGON_SPRITES_SHA
if (!SHA || !/^[0-9a-f]{40}$/.test(SHA)) {
  console.error(
    'SMOGON_SPRITES_SHA must be a 40-char commit SHA from smogon/sprites.\n' +
      'Get one with: gh api repos/smogon/sprites/commits/master --jq .sha',
  )
  process.exit(1)
}

interface SpeciesInfo {
  type: string
  num: number
  formeNum: number
  base: string
  forme: string
  sid: string
}

interface GhContentEntry {
  name: string
  type: string
}

const ghHeaders: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'gale-wings-build-sprite-manifest',
}
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN
if (token) ghHeaders.Authorization = `Bearer ${token}`

const fetchJson = async <T>(url: string, headers: Record<string, string> = {}): Promise<T> => {
  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

// 1. Fetch species.json (raw, no rate limit).
const speciesData = await fetchJson<Record<string, SpeciesInfo>>(
  `https://raw.githubusercontent.com/smogon/sprites/${SHA}/data/species.json`,
)

// 2. List src/champions/ via contents API.
const dirContents = await fetchJson<GhContentEntry[]>(
  `https://api.github.com/repos/smogon/sprites/contents/src/champions?ref=${SHA}`,
  ghHeaders,
)

const availableSids = new Set(
  dirContents
    .filter((f) => f.type === 'file' && f.name.endsWith('.png') && !f.name.includes('-s.'))
    .map((f) => f.name.replace('.png', '')),
)
if (availableSids.size === 0) {
  throw new Error('src/champions listing was empty — SHA wrong, or repo structure changed.')
}

// 3. Invert species.json → canonical name → sid, restricted to sids that have
//    a PNG in src/champions/.
const rawEntries: Record<string, string> = {}
for (const info of Object.values(speciesData)) {
  if (info.type !== 'specie') continue
  if (!availableSids.has(info.sid)) continue
  const canonical = info.forme ? `${info.base}-${info.forme}` : info.base
  if (rawEntries[canonical] && rawEntries[canonical] !== info.sid) {
    throw new Error(
      `Duplicate canonical name '${canonical}': sids ${rawEntries[canonical]} and ${info.sid}`,
    )
  }
  rawEntries[canonical] = info.sid
}

// Sanity check coverage: every sid with a PNG should have come back through a
// specie entry. Anything missing means species.json drifted from the
// directory listing — fix it before baking a stale manifest.
const sidsWithName = new Set(Object.values(rawEntries))
const orphanSids = [...availableSids].filter((sid) => !sidsWithName.has(sid))
if (orphanSids.length) {
  throw new Error(
    `${orphanSids.length} sid(s) in src/champions/ have no specie entry in species.json: ${orphanSids
      .slice(0, 20)
      .join(', ')}${orphanSids.length > 20 ? ' …' : ''}`,
  )
}

// 4. Cross-check every entry round-trips through getSpecies(). Anything that
//    doesn't goes into `overrides` so future maintainers see exactly where
//    species.json's naming diverges from @pkmn/dex's.
const overrides: Record<string, string> = {
  // Populate as mismatches arise; format: species.json canonical → @pkmn/dex canonical.
}

const mismatches: string[] = []
const resolvedEntries: Record<string, string> = {}
for (const [name, sid] of Object.entries(rawEntries)) {
  const lookupName = overrides[name] ?? name
  const species = getSpecies(lookupName)
  if (!species?.exists || species.name !== lookupName) {
    mismatches.push(
      `${name} (sid ${sid}): getSpecies('${lookupName}') returned '${species?.name ?? 'none'}' (exists=${species?.exists})`,
    )
    continue
  }
  resolvedEntries[species.name] = sid
}

if (mismatches.length) {
  throw new Error(
    `Name mismatches between species.json and @pkmn/dex:\n  ${mismatches.join('\n  ')}\n\nAdd entries to overrides{} in scripts/build-sprite-manifest.ts to fix.`,
  )
}

// 5. Sort alphabetically for stable diffs.
const sortedEntries: Record<string, string> = Object.fromEntries(
  Object.entries(resolvedEntries).sort(([a], [b]) => a.localeCompare(b)),
)

// 6. Sprite dimensions — Champions sprites are 128x128 per Smogon's directory
//    conventions. If a future bump changes this, verify by decoding one PNG's
//    IHDR and update here.
const SPRITE_W = 128
const SPRITE_H = 128

const manifest = {
  generatedAt: new Date().toISOString(),
  source: {
    repo: 'smogon/sprites',
    ref: SHA,
    path: 'src/champions',
  },
  baseUrl: `https://cdn.jsdelivr.net/gh/smogon/sprites@${SHA}/src/champions/`,
  spriteWidth: SPRITE_W,
  spriteHeight: SPRITE_H,
  entries: sortedEntries,
}

const outPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/sprites/manifest.json',
)
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n')

console.log(
  `Wrote ${Object.keys(sortedEntries).length} entries to ${outPath}\n` +
    `  source: smogon/sprites @ ${SHA}\n` +
    `  baseUrl: ${manifest.baseUrl}`,
)
