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
//
// Upstream restructured at bad55c7 (2026-09-12): data/species.json is gone
// and filenames switched from opaque numeric sids (s14720.png) to an encoded
// grammar documented in the repo's src/README.md:
//
//   <kind><name>[-o<forme>][-<flag>...].png
//
//   kind   s specie, i item, x literal (Egg, Substitute, ...)
//   name   the name lowercased with punctuation flattened away: a run of
//          non-alphanumerics becomes _ when it separates words and vanishes
//          otherwise (Mr. Mime → mr_mime, Farfetch’d → farfetchd)
//   forme  same encoding, carried in the -o flag (Toxtricity-Low-Key →
//          stoxtricity-olow_key, Meowstic-F-Mega → smeowstic-of_mega)
//   flags  -s shiny  -f female  -b back  -a asymmetrical  -g gmax/game
//
// Removing the _s from <name><forme> yields exactly the Pokémon Showdown id,
// which round-trips through getSpecies() to the canonical @pkmn/dex name —
// so the manifest now derives from the directory listing alone.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { toID } from '@smogon/calc'

import { getSpecies } from '../src/dex'

const SHA = process.env.SMOGON_SPRITES_SHA
if (!SHA || !/^[0-9a-f]{40}$/.test(SHA)) {
  console.error(
    'SMOGON_SPRITES_SHA must be a 40-char commit SHA from smogon/sprites.\n' +
      'Get one with: gh api repos/smogon/sprites/commits/master --jq .sha',
  )
  process.exit(1)
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

// 1. List src/champions/ via the contents API.
const dirContents = await fetchJson<GhContentEntry[]>(
  `https://api.github.com/repos/smogon/sprites/contents/src/champions?ref=${SHA}`,
  ghHeaders,
)

// 2. Decode filenames per the grammar above. A base sprite carries no flags
//    beyond the forme; shiny/female variants share their base's stem plus a
//    trailing flag, so getSpriteUrl() reconstructs them by suffix and they
//    need no manifest entry of their own.
const baseStems: { stem: string; id: string }[] = []
const variantStems: { stem: string; baseStem: string }[] = []
for (const f of dirContents) {
  if (f.type !== 'file' || !f.name.endsWith('.png')) continue
  const stem = f.name.replace(/\.png$/, '')
  const [head, ...flagParts] = stem.split('-')
  if (!head.startsWith('s')) continue // no item/x sprites in champions today
  const forme = flagParts.find((p) => p.startsWith('o'))?.slice(1)
  const isVariant = flagParts.some((p) => !p.startsWith('o'))
  if (isVariant) {
    variantStems.push({ stem, baseStem: forme ? `${head}-o${forme}` : head })
  } else {
    baseStems.push({ stem, id: (head.slice(1) + (forme ?? '')).replace(/_/g, '') })
  }
}
if (baseStems.length === 0) {
  throw new Error('src/champions listing was empty — SHA wrong, or repo structure changed.')
}

// Sanity check coverage: every variant file must share a stem with a base
// sprite, or getSpriteUrl()'s suffix reconstruction would 404 for it. A miss
// means the grammar drifted — fix it before baking a stale manifest.
const baseSet = new Set(baseStems.map((b) => b.stem))
const orphanVariants = variantStems.filter((v) => !baseSet.has(v.baseStem)).map((v) => v.stem)
if (orphanVariants.length) {
  throw new Error(
    `${orphanVariants.length} variant sprite(s) in src/champions/ have no base sprite: ${orphanVariants
      .slice(0, 20)
      .join(', ')}${orphanVariants.length > 20 ? ' …' : ''}`,
  )
}

// 3. Cross-check every entry round-trips through getSpecies(): the decoded id
//    must come back as a real species whose canonical name re-encodes to the
//    same id — alias fuzz in the dex can't silently mislabel a sprite that
//    way. Anything that doesn't goes into `overrides` so future maintainers
//    see exactly where the filename grammar diverges from @pkmn/dex's naming.
const overrides: Record<string, string> = {
  // Populate as mismatches arise; format: filename stem → @pkmn/dex canonical.
}

const mismatches: string[] = []
const resolvedEntries: Record<string, string> = {}
for (const { stem, id } of baseStems) {
  const lookupName = overrides[stem] ?? id
  const species = getSpecies(lookupName)
  const roundTrips = overrides[stem]
    ? species?.name === lookupName
    : toID(species?.name ?? '') === id
  if (!species?.exists || !roundTrips) {
    mismatches.push(
      `${stem}: getSpecies('${lookupName}') returned '${species?.name ?? 'none'}' (exists=${species?.exists})`,
    )
    continue
  }
  if (resolvedEntries[species.name]) {
    throw new Error(
      `Duplicate canonical name '${species.name}': stems ${resolvedEntries[species.name]} and ${stem}`,
    )
  }
  resolvedEntries[species.name] = stem
}

if (mismatches.length) {
  throw new Error(
    `Name mismatches between src/champions/ filenames and @pkmn/dex:\n  ${mismatches.join('\n  ')}\n\nAdd entries to overrides{} in scripts/build-sprite-manifest.ts to fix.`,
  )
}

// 4. Sort alphabetically for stable diffs.
const sortedEntries: Record<string, string> = Object.fromEntries(
  Object.entries(resolvedEntries).sort(([a], [b]) => a.localeCompare(b)),
)

// 5. Sprite dimensions — Champions sprites are 128x128 per Smogon's directory
//    conventions (re-verified against sabsol.png's IHDR at bad55c7). If a
//    future bump changes this, verify by decoding one PNG's IHDR and update.
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
