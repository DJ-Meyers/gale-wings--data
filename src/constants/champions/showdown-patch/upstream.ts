// Shared plumbing for reading smogon/pokemon-showdown data tables straight
// from the repo: used by showdown-patch.test.ts (network parity check) and by
// the uncommitted generator (see index.ts). Not part of the published
// package — nothing under src/ reachable from a tsup entry imports it.
//
// Upstream tables are near-declarative TypeScript: one `export const X: <type>
// = { ... }` whose only non-JSON content is function-valued battle callbacks
// (with typed parameters, so plain JS evaluation would choke). `typescript`
// (already a devDependency) transpiles the module to CommonJS; a JSON
// round-trip then drops the callbacks, which the dex layer never reads.

import { createHash } from 'node:crypto'

import ts from 'typescript'

export const SHOWDOWN_REPO = 'smogon/pokemon-showdown'

export const UPSTREAM_TABLES = {
  Abilities: 'data/mods/champions/abilities.ts',
  FormatsData: 'data/mods/champions/formats-data.ts',
  Items: 'data/mods/champions/items.ts',
  Learnsets: 'data/mods/champions/learnsets.ts',
  Moves: 'data/mods/champions/moves.ts',
  Pokedex: 'data/pokedex.ts',
} as const

export type UpstreamTableName = keyof typeof UPSTREAM_TABLES

// Any JSON-shaped data table entry (learnset wrapper, move override, species).
export type UpstreamEntry = Record<string, unknown>
export type UpstreamTable = Record<string, UpstreamEntry | null>

export const rawUrl = (ref: string, path: string): string =>
  `https://raw.githubusercontent.com/${SHOWDOWN_REPO}/${ref}/${path}`

export const fetchUpstreamSource = async (
  ref: string,
  path: string,
): Promise<string> => {
  const res = await fetch(rawUrl(ref, path))
  if (!res.ok) {
    throw new Error(`GET ${path}@${ref} → ${res.status} ${res.statusText}`)
  }
  return res.text()
}

export const sha256 = (text: string): string =>
  createHash('sha256').update(text).digest('hex')

// Evaluate one upstream table source and return it as plain JSON data.
export const evaluateUpstreamTable = (source: string): UpstreamTable => {
  const exportCount = (source.match(/^export const /gm) ?? []).length
  if (exportCount !== 1) {
    throw new Error(
      `expected exactly one 'export const' in upstream table, found ${exportCount} — upstream shape changed`,
    )
  }
  const { outputText, diagnostics } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  })
  if (diagnostics?.length) {
    throw new Error(
      `upstream table failed to transpile: ${diagnostics.map((d) => String(d.messageText)).join('; ')}`,
    )
  }
  const exportsObject: Record<string, unknown> = {}
  const module = { exports: exportsObject }
  // The tables import nothing, so no `require` is provided — a stray import
  // upstream throws here instead of silently resolving to undefined.
  new Function('exports', 'module', outputText)(exportsObject, module)
  const tables = Object.values(exportsObject).filter(
    (v) => v && typeof v === 'object',
  )
  if (tables.length !== 1) {
    throw new Error(`expected one exported table, found ${tables.length}`)
  }
  return JSON.parse(JSON.stringify(tables[0])) as UpstreamTable
}
