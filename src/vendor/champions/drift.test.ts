import { createHash } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import meta from './meta.json'

// Drift detection for the vendored Champions data, in the spirit of the
// sprite manifest's drift test — but where sprite coverage is checkable
// offline, "has Showdown moved past our pin?" inherently needs the network,
// so this suite degrades to a skip-with-warning when offline.
//
// Two checks per vendored source file:
//   1. Provenance (hard failure): the file at the pinned SHA must hash to
//      what meta.json recorded at generation time. SHA-addressed raw URLs
//      are immutable, so a mismatch means the vendored JSON does not come
//      from the source it claims — regenerate, don't hand-edit.
//   2. Drift (warning only): the file at master hashing differently just
//      means upstream moved — expected over time, and a deliberate bump via
//      `SHOWDOWN_SHA=<new> pnpm build:champions-data` is the remedy. Failing
//      CI on every upstream commit would make red meaningless, so this
//      surfaces as a loud console.warn, mirroring the sprite pin's
//      "bumps are intentional" stance.

const { repo, ref, path } = meta.source
const files = Object.keys(meta.sourceHashes) as (keyof typeof meta.sourceHashes)[]

const sha256 = (text: string): string =>
  createHash('sha256').update(text).digest('hex')

const fetchHash = async (gitRef: string, file: string): Promise<string> => {
  const res = await fetch(
    `https://raw.githubusercontent.com/${repo}/${gitRef}/${path}/${file}`,
  )
  if (!res.ok) throw new Error(`GET ${file}@${gitRef} → ${res.status}`)
  return sha256(await res.text())
}

describe('vendored champions data pin', () => {
  it('meta.json pins a full commit SHA', () => {
    expect(ref).toMatch(/^[0-9a-f]{40}$/)
    expect(files.length).toBeGreaterThan(0)
  })

  it('matches its pinned source and warns when master drifts', async (ctx) => {
    let hashes: { pinned: string; master: string }[]
    try {
      hashes = await Promise.all(
        files.map(async (file) => ({
          pinned: await fetchHash(ref, file),
          master: await fetchHash('master', file),
        })),
      )
    } catch (err) {
      console.warn(
        `[champions-data drift] skipped: could not reach raw.githubusercontent.com (${String(err)})`,
      )
      ctx.skip()
      return
    }

    const provenanceMismatches = files.filter(
      (file, i) => hashes[i].pinned !== meta.sourceHashes[file],
    )
    // Hard failure: the vendored JSON's recorded inputs don't match the
    // immutable pinned source. Rerun `pnpm build:champions-data`.
    expect(provenanceMismatches).toEqual([])

    const drifted = files.filter(
      (_file, i) => hashes[i].master !== hashes[i].pinned,
    )
    if (drifted.length) {
      console.warn(
        `[champions-data drift] ${repo} master has moved past pin ${ref.slice(0, 8)} for: ` +
          `${drifted.join(', ')}. Review upstream changes and bump with ` +
          `SHOWDOWN_SHA=<new-sha> pnpm build:champions-data`,
      )
    }
  }, 30_000)
})
