# @dj-meyers/galewings

Shared schemas and types for the Galewings API. Three entry points:

- `@dj-meyers/galewings/schemas` — zod schemas (runtime-validatable; source of truth)
- `@dj-meyers/galewings/types` — domain types derived from the schemas via `z.infer`
- `@dj-meyers/galewings/router` — the tRPC `AppRouter` type (for client inference only)

The subpath split keeps the `AppRouter` type lazy so consumers that only need
domain types or schemas don't pull in server-internal type machinery.

## Build note: cross-package source include

`tsconfig.build.json` intentionally `include`s `../server/src/**/*.ts` and
maps `~/*` to the server's source tree. This is so `src/router.ts` can
re-export `AppRouter` from `@galewings/server` and have tsc inline the full
type into `dist/router.d.ts` (downstream consumers of `@dj-meyers/galewings`
never resolve `~/*` at type-check time — they only see the bundled `.d.ts`).

Consequences to keep in mind, not to "fix":

- This bypasses the project-references graph and introduces a soft
  workspace cycle (`shared-types` devDeps `@galewings/server`, which
  depends on `@dj-meyers/galewings`). pnpm tolerates it; pre-existing cycle
  warnings will mask any real cycle added later — investigate before
  dismissing.
- Running `pnpm --filter @dj-meyers/galewings build` before the server source
  typechecks will fail in a confusing way. Build the server first or run
  `pnpm -r build` from the root.
