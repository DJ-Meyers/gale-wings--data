import { readFileSync } from 'node:fs'

import { Dex } from '@pkmn/dex'
import { describe, expect, it } from 'vitest'

import {
  getAbility,
  getItem,
  getMove,
  getMoveName,
  getOwnMoveNamesOf,
  getSpecies,
} from '~/dex'

import {
  learnsetPatch,
  showdownPatch,
  showdownPatchMeta as meta,
} from './index'
import {
  evaluateUpstreamTable,
  fetchUpstreamSource,
  sha256,
  UPSTREAM_TABLES,
  type UpstreamEntry,
  type UpstreamTable,
  type UpstreamTableName,
} from './upstream'

const installedVersion = (pkg: string): string =>
  (
    JSON.parse(
      readFileSync(
        new URL(`../../../../node_modules/${pkg}/package.json`, import.meta.url),
        'utf8',
      ),
    ) as { version: string }
  ).version

const ns = (v: { isNonstandard?: string | null } | null | undefined): string | null =>
  v?.isNonstandard ?? null

// ---------------------------------------------------------------------------
// Offline: the committed patch is internally consistent and applied.

describe('showdown patch (offline)', () => {
  it('pins a full commit SHA', () => {
    expect(meta.source.ref).toMatch(/^[0-9a-f]{40}$/)
    expect(Object.keys(meta.sourceHashes)).toEqual(
      Object.values(UPSTREAM_TABLES),
    )
  })

  // The patch is a delta over exact installed versions. Dependabot bumping
  // either package must fail here so the delta gets regenerated (and shrinks).
  it('was generated against the installed @pkmn/mods and @pkmn/dex', () => {
    expect(meta.installed).toEqual({
      '@pkmn/mods': installedVersion('@pkmn/mods'),
      '@pkmn/dex': installedVersion('@pkmn/dex'),
    })
  })

  it('never emits a null (deletion) entry', () => {
    for (const table of Object.values(showdownPatch)) {
      expect(Object.values(table).every((entry) => entry !== null)).toBe(true)
    }
  })

  it('patches only ids the dex knows', () => {
    const missing = [
      ...Object.keys(showdownPatch.Abilities).filter((id) => !getAbility(id).exists),
      ...Object.keys(showdownPatch.Items).filter((id) => !getItem(id).exists),
      ...Object.keys(showdownPatch.Moves).filter((id) => !getMove(id).exists),
      ...Object.keys(showdownPatch.FormatsData).filter((id) => !getSpecies(id).exists),
      ...Object.keys(showdownPatch.Species).filter((id) => !getSpecies(id).exists),
      ...Object.keys(learnsetPatch).filter((id) => !getSpecies(id).exists),
    ]
    expect(missing).toEqual([])
  })

  it('learnset deltas are disjoint, legal, and applied', () => {
    for (const [id, { add, remove }] of Object.entries(learnsetPatch)) {
      expect(add.filter((m) => remove.includes(m))).toEqual([])
      const own = getOwnMoveNamesOf(id)
      for (const move of add) {
        expect(getMove(move).exists, `${id} add ${move}`).toBe(true)
        expect(ns(getMove(move)), `${id} add ${move} legal`).toBeNull()
        expect(own, `${id} learns ${move}`).toContain(getMoveName(move))
      }
      for (const move of remove) {
        expect(own, `${id} no longer learns ${move}`).not.toContain(getMoveName(move))
      }
    }
  })

  // Regressions pinned to the M-C cut (the species become legal in the
  // regulation file; the data must already be right here).
  it.each(['Pyro Ball', 'Glaive Rush', 'Snipe Shot', 'Overdrive', 'Meteor Assault', 'Double Shock', 'Slash', 'Milk Drink'])(
    'un-flags %s',
    (name) => {
      expect(ns(getMove(name))).toBeNull()
    },
  )

  it.each(['Hidden Power', 'Tera Blast'])('keeps %s flagged', (name) => {
    expect(ns(getMove(name))).not.toBeNull()
  })

  it.each(['Leek', 'Rocky Helmet', 'Eject Button', 'Absolite Z', 'Golisopite'])(
    'un-flags item %s',
    (name) => {
      expect(ns(getItem(name))).toBeNull()
    },
  )

  it.each([
    ['Wigglytuff', 'Moonblast'],
    ['Grapploct', 'Storm Throw'],
    ['Gogoat', 'Milk Drink'],
    ['Garchomp', 'Slash'],
    ['Cinderace', 'Pyro Ball'],
  ])('%s learns %s', (species, move) => {
    expect(getOwnMoveNamesOf(species)).toContain(move)
  })

  it('drops Champions-removed TMs from a vanilla-sourced learnset', () => {
    // Wigglytuff has no installed override; Gen 9 vanilla lists Toxic and
    // Attract, which the Champions learnset omits.
    const own = getOwnMoveNamesOf('Wigglytuff')
    expect(own).not.toContain('Toxic')
    expect(own).not.toContain('Attract')
  })

  it.each(['Rillaboom', 'Farfetch’d', 'Squawkabilly-Blue', 'Absol-Mega-Z'])(
    'marks %s standard (M-C legality flip)',
    (name) => {
      expect(ns(getSpecies(name))).toBeNull()
    },
  )

  it('corrects the Champions Mega abilities @pkmn/dex has stale', () => {
    expect(getSpecies('Absol-Mega-Z').abilities).toEqual({ 0: 'Sharpness' })
    expect(getSpecies('Garchomp-Mega-Z').abilities).toEqual({ 0: 'Levitate' })
    expect(getSpecies('Lucario-Mega-Z').abilities).toEqual({ 0: 'Aura Guard' })
    expect(getSpecies('Golisopod-Mega').abilities).toEqual({ 0: 'Tough Claws' })
    expect(getSpecies('Baxcalibur-Mega').abilities).toEqual({ 0: 'Thermal Exchange' })
    // Official Gen 6 data — untouched.
    expect(getSpecies('Salamence-Mega').abilities).toEqual({ 0: 'Aerilate' })
  })
})

// ---------------------------------------------------------------------------
// Network: provenance + full parity against the pin, drift warning for master.
// Skips with a warning when raw.githubusercontent.com is unreachable.

describe('showdown patch (network parity)', () => {
  it('matches upstream at the pin and warns when master drifts', async (ctx) => {
    const { ref } = meta.source
    const entries = Object.entries(UPSTREAM_TABLES) as [UpstreamTableName, string][]
    let pinned: Record<UpstreamTableName, string>
    let masterHashes: Record<string, string>
    try {
      const fetched = await Promise.all(
        entries.map(async ([name, path]) => ({
          name,
          path,
          pinned: await fetchUpstreamSource(ref, path),
          master: sha256(await fetchUpstreamSource('master', path)),
        })),
      )
      pinned = Object.fromEntries(fetched.map((f) => [f.name, f.pinned])) as typeof pinned
      masterHashes = Object.fromEntries(fetched.map((f) => [f.path, f.master]))
    } catch (err) {
      console.warn(
        `[showdown-patch] parity check skipped: could not reach raw.githubusercontent.com (${String(err)})`,
      )
      ctx.skip()
      return
    }

    // Provenance (hard failure): the pinned sources hash to what meta.json
    // recorded at generation time. SHA-addressed raw URLs are immutable, so a
    // mismatch means the patch does not come from where it claims.
    const hashes = meta.sourceHashes as Record<string, string>
    for (const [name, path] of entries) {
      expect(sha256(pinned[name]), `provenance ${path}`).toBe(hashes[path])
    }

    const upstream = Object.fromEntries(
      entries.map(([name]) => [name, evaluateUpstreamTable(pinned[name])]),
    ) as Record<UpstreamTableName, UpstreamTable>
    const gen9 = Dex.forGen(9)
    const vanilla = {
      Abilities: gen9.data.Abilities as unknown as UpstreamTable,
      Items: gen9.data.Items as unknown as UpstreamTable,
      Moves: gen9.data.Moves as unknown as UpstreamTable,
    }
    // Upstream's effective flag: an override that sets isNonstandard wins,
    // otherwise the vanilla flag applies.
    const expectedFlag = (
      table: UpstreamTable,
      fallback: UpstreamTable,
      id: string,
    ): string | null => {
      const m = table[id]
      if (m && ('isNonstandard' in m || !m.inherit)) return ns(m as UpstreamEntry)
      return ns(fallback[id] as UpstreamEntry | null)
    }
    const isLegalMove = (id: string): boolean =>
      expectedFlag(upstream.Moves, vanilla.Moves, id) === null &&
      (id in upstream.Moves || id in vanilla.Moves)

    // Parity: every move / item / ability upstream touches has the same
    // legality in our dex.
    const flagMismatches: string[] = []
    for (const id of Object.keys(upstream.Moves)) {
      if (expectedFlag(upstream.Moves, vanilla.Moves, id) !== ns(getMove(id))) flagMismatches.push(`move ${id}`)
    }
    for (const id of Object.keys(upstream.Items)) {
      if (expectedFlag(upstream.Items, vanilla.Items, id) !== ns(getItem(id))) flagMismatches.push(`item ${id}`)
    }
    for (const id of Object.keys(upstream.Abilities)) {
      if (expectedFlag(upstream.Abilities, vanilla.Abilities, id) !== ns(getAbility(id))) flagMismatches.push(`ability ${id}`)
    }
    // Species legality comes from formats-data (full entries, no inherit).
    for (const id of Object.keys(upstream.FormatsData)) {
      if (ns(upstream.FormatsData[id]) !== ns(getSpecies(id))) flagMismatches.push(`species ${id}`)
    }
    expect(flagMismatches).toEqual([])

    // Parity: every upstream Champions learnset equals ours, move for move.
    const learnsetMismatches: string[] = []
    for (const [id, entry] of Object.entries(upstream.Learnsets)) {
      const expected = Object.keys((entry?.learnset as object) ?? {})
        .filter(isLegalMove)
        .map((m) => getMoveName(m))
        .toSorted()
      const actual = getOwnMoveNamesOf(id).toSorted()
      if (JSON.stringify(expected) !== JSON.stringify(actual)) learnsetMismatches.push(id)
    }
    expect(learnsetMismatches).toEqual([])

    // Parity: dex-relevant species fields for every upstream-legal species.
    const speciesMismatches: string[] = []
    for (const id of Object.keys(upstream.FormatsData)) {
      if (ns(upstream.FormatsData[id]) !== null) continue
      const m = upstream.Pokedex[id]
      const s = getSpecies(id)
      if (!m || !s.exists) {
        speciesMismatches.push(`${id} (missing)`)
        continue
      }
      for (const field of ['abilities', 'baseStats', 'types', 'weightkg', 'requiredItem'] as const) {
        if (JSON.stringify(m[field] ?? null) !== JSON.stringify(s[field] ?? null)) {
          speciesMismatches.push(`${id}.${field}`)
        }
      }
    }
    expect(speciesMismatches).toEqual([])

    // Drift (warning only): master moving past the pin is expected over time;
    // bump deliberately by regenerating the delta at a new SHA (see index.ts).
    const drifted = entries
      .filter(([, path]) => masterHashes[path] !== hashes[path])
      .map(([, path]) => path)
    if (drifted.length) {
      console.warn(
        `[showdown-patch] ${meta.source.repo} master has moved past pin ${ref.slice(0, 8)} for: ` +
          `${drifted.join(', ')}. Review upstream changes and regenerate the ` +
          'delta at a new SHA (see showdown-patch/index.ts).',
      )
    }
  }, 60_000)
})
