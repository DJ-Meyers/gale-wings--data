// One-off: compare @pkmn/dex@0.10.10 bundled abilities to PS master, for every
// species in VGC 2026 M-B's legal pool. Output: drift count + per-species
// before/after. Informs whether dex.ts needs a small override map or a full
// PS-overlay layer.

import { readFileSync } from 'node:fs'

import { Dex } from '@pkmn/dex'
import * as champions from '@pkmn/mods/champions'

// Build the actual dex the data package builds — Champions mod over @pkmn/dex.
const dex = Dex.mod('champions', champions)

// 1. Legal species (from regulation file — quick regex pull).
const regSrc = readFileSync(
  new URL('../src/constants/champions/regulation/vgc-2026-m-b.ts', import.meta.url),
  'utf8',
)
const blockMatch = regSrc.match(/const legalSpecies = \[([\s\S]*?)\] as const/)
if (!blockMatch) throw new Error("Couldn't find legalSpecies block")
const legalSpecies = [...blockMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
console.log(`Regulation species count: ${legalSpecies.length}`)

// 2. Fetch PS pokedex.ts at the SHA we cited earlier.
const PS_SHA = '755f4665a341e3a9533baf1e1a3802fd233b0d69'
const psUrl = `https://raw.githubusercontent.com/smogon/pokemon-showdown/${PS_SHA}/data/pokedex.ts`
const psText = await fetch(psUrl).then((r) => r.text())

// 3. Parse PS abilities table. Each species block is `\t<id>: {\n\t\t...\n\t},`.
// Inside we look for `abilities: { ... },`. Allow nested braces in case future
// values add structure (currently just key/value pairs).
const psAbilities = new Map()
const blockRe = /^\t([a-z0-9]+): \{\n([\s\S]*?)\n\t\},$/gm
for (const block of psText.matchAll(blockRe)) {
  const id = block[1]
  const body = block[2]
  const abilMatch = body.match(/^\t\tabilities: (\{[^}]*\}),$/m)
  if (abilMatch) psAbilities.set(id, abilMatch[1])
}
console.log(`PS species parsed: ${psAbilities.size}`)

const toID = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

// 4. Compare bundled (via Dex) vs PS for each legal species.
const normalize = (s) => s.replace(/\s+/g, ' ').replace(/'/g, '"').trim()
// Render dex.data.Species[id].abilities the same way PS writes it inline so
// string compare is meaningful. PS uses `0:` / `1:` / `H:` keys.
const renderAbilities = (a) => {
  const parts = []
  if (a[0] !== undefined) parts.push(`0: "${a[0]}"`)
  if (a[1] !== undefined) parts.push(`1: "${a[1]}"`)
  if (a.H !== undefined) parts.push(`H: "${a.H}"`)
  if (a.S !== undefined) parts.push(`S: "${a.S}"`)
  return `{ ${parts.join(', ')} }`
}

const drifted = []
const missingPs = []
for (const name of legalSpecies) {
  const id = toID(name)
  const psAbil = psAbilities.get(id)
  if (!psAbil) {
    missingPs.push(name)
    continue
  }
  const sp = dex.species.get(name)
  if (!sp?.exists) {
    missingPs.push(`${name} (not in bundled dex)`)
    continue
  }
  const bundledRendered = normalize(renderAbilities(sp.abilities))
  const psRendered = normalize(psAbil)
  if (bundledRendered !== psRendered) {
    drifted.push({ name, id, bundled: bundledRendered, ps: psRendered })
  }
}

console.log(`\n=== Drift summary ===`)
console.log(`Species with ability drift: ${drifted.length}/${legalSpecies.length}`)
console.log(`Species not found in PS master: ${missingPs.length}`)

if (missingPs.length > 0) {
  console.log(`\nMissing from PS master:`)
  for (const n of missingPs) console.log(`  ${n}`)
}

if (drifted.length > 0) {
  console.log(`\n=== Drifted species ===`)
  for (const d of drifted) {
    console.log(`${d.name}`)
    console.log(`  bundled: ${d.bundled}`)
    console.log(`  ps:      ${d.ps}`)
  }
}
